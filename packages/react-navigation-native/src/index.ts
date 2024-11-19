import {
  EventListenerCallback,
  EventMapCore,
  NavigationProp,
  Route,
  RouteProp,
  useNavigation,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import { createUseFunnel } from '@use-funnel/core';
import { useEffect, useMemo, useRef } from 'react';

export * from '@use-funnel/core';

const navigationParamName = '__useFunnelState';

type NativeFunnelState = {
  step?: string;
  context?: any;
  index: number;
  histories?: any[];
  isOverlay?: boolean;
};

type NativeFunnelParam = {
  [navigationParamName]?: Record<string, NativeFunnelState>;
};

type NativeFunnelParamList = Record<string, NativeFunnelParam>;

type NativeFunnelNavigation = NavigationProp<Record<string, NativeFunnelParam | undefined>>;

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const navigation = useNavigation<NativeFunnelNavigation>();
  const route = useRoute<RouteProp<NativeFunnelParamList>>();
  const routes = useNavigationState<NativeFunnelParamList, Route<string, NativeFunnelParam>[]>((state) => state.routes);

  const useFunnelState = route.params?.[navigationParamName];
  const params = useFunnelState?.[id];

  const currentStep = params?.step;
  const currentContext = params?.context;
  const currentState = useMemo(() => {
    return currentStep != null && currentContext != null
      ? ({
          step: currentStep,
          context: currentContext,
        } as typeof initialState)
      : initialState;
  }, [currentStep, currentContext, initialState]);

  const history: (typeof initialState)[] = useMemo(() => params?.histories ?? [currentState], [params, currentState]);
  const currentIndex = history.length - 1;

  const overlayStepMapRef = useRef<Record<string, boolean>>({});

  const isOverlay = params?.isOverlay ?? false;
  overlayStepMapRef.current[currentState.step] = isOverlay;

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !isOverlay,
    });

    if (isOverlay) {
      const beforeState = history[currentIndex - 1];
      const handleBeforeRemove: EventListenerCallback<EventMapCore<any>, 'beforeRemove'> = (e) => {
        if (navigation.isFocused()) {
          e.preventDefault();
          navigation.setParams({
            ...route.params,
            [navigationParamName]: {
              ...useFunnelState,
              [id]: {
                step: beforeState.step,
                context: beforeState.context,
                index: currentIndex - 1,
                histories: history.slice(0, currentIndex),
                isOverlay: overlayStepMapRef.current[beforeState.step],
              },
            },
          });
        }
      };
      navigation.addListener('beforeRemove', handleBeforeRemove);
      return () => {
        navigation.removeListener('beforeRemove', handleBeforeRemove);
      };
    }
  }, [isOverlay]);

  return useMemo(
    () => ({
      history,
      currentIndex,
      push(state, option) {
        const funnelState: NativeFunnelState = {
          step: state.step,
          context: state.context,
          index: currentIndex + 1,
          histories: [...(history ?? []), state],
          isOverlay: option?.renderComponent?.overlay ?? false,
        };
        if (funnelState.isOverlay) {
          navigation.setParams({
            ...route.params,
            [navigationParamName]: {
              ...useFunnelState,
              [id]: funnelState,
            },
          });
        } else {
          navigation.navigate({
            ...route,
            key: `${navigationParamName}::${id}::${currentIndex + 1}`,
            params: {
              ...route.params,
              [navigationParamName]: {
                ...useFunnelState,
                [id]: funnelState,
              },
            },
          });
        }
      },
      replace(state) {
        navigation.setParams({
          ...route.params,
          [navigationParamName]: {
            ...useFunnelState,
            [id]: {
              step: state.step,
              context: state.context,
              index: currentIndex,
              histories: [...(history ?? []).slice(0, currentIndex), state],
            },
          },
        });
      },
      go(delta) {
        if (delta === -1) {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            // FIXME: 미완성 코드. 관련 에러: https://github.com/toss/use-funnel/issues/77
            // 이렇게 해도 네이티브 뒤로가기 시의 문제는 여전히 해결할 수 없음
            if (params && navigation.getState().index === 0 && params.isOverlay) {
              const prevHistory = (params.histories ?? [])[params.index - 1];
              const newState: NativeFunnelState = {
                step: prevHistory.step,
                context: prevHistory.context,
                index: params.index - 1,
                histories: (params.histories ?? []).slice(0, params.index),
                isOverlay: overlayStepMapRef.current[prevHistory.step],
              };
              navigation.setParams({
                ...route.params,
                [navigationParamName]: {
                  ...useFunnelState,
                  [id]: newState,
                },
              });
            }
          }
        } else {
          // find delta index
          const deltaIndex = currentIndex + delta;
          const targetRoute = routes.find((target) => {
            if (target.name === route.name) {
              const params = target.params?.[navigationParamName]?.[id];
              if (params != null) {
                return params.index === deltaIndex;
              }
            }
            return false;
          });
          if (targetRoute != null) {
            navigation.navigate(targetRoute);
          }
        }
      },
    }),
    [currentState, history, currentIndex, navigation, route, params, useFunnelState, routes],
  );
});
