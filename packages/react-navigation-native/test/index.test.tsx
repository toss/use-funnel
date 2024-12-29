import { setImmediate } from 'timers';
import { createNavigationContainerRef, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { render, screen, userEvent } from '@testing-library/react-native';
import { Button, Text, View } from 'react-native';
import { useFunnel } from '../src/index.js';

const Stack = createNativeStackNavigator();
globalThis.setImmediate = setImmediate;

describe('Test useFunnel react-navigation-native router', () => {
  test('should work', async () => {
    function FunnelTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
        C: {};
        Overlay: {};
      }>({
        id: 'vitest',
        initial: {
          step: 'A',
          context: {},
        },
      });
      const navigation = useNavigation();
      return (
        <funnel.Render
          A={({ history }) => (
            <View>
              <Button title="A : Go B" onPress={() => history.push('B', { id: 'vitest' })} />
              <Button title="A : Go C" onPress={() => history.push('C')} />
            </View>
          )}
          Overlay={funnel.Render.overlay({
            render({ close }) {
              return (
                <View>
                  <Text>Overlay : title</Text>
                  <Button
                    title="Overlay : Close Overlay"
                    onPress={() => {
                      close();
                    }}
                  />
                </View>
              );
            },
          })}
          B={({ context, history }) => (
            <View>
              <Button
                title="B : Go Back"
                onPress={() => {
                  navigation.goBack();
                }}
              />
              <Text>B title : {context.id}</Text>
              <Button title="B : Go Overlay" onPress={() => history.push('Overlay')} />
            </View>
          )}
          C={({ history }) => (
            <View>
              <Button
                title="C : Replace to B"
                onPress={() => {
                  history.replace('B', { id: 'replace-test' });
                }}
              />
            </View>
          )}
        />
      );
    }

    const navigationRef = createNavigationContainerRef();

    render(
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={FunnelTest} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    const user = userEvent.setup();

    // The first screen is "A"
    expect(screen.queryByText('A : Go B')).not.toBeNull();

    // When the user presses the "A : Go B" button
    await user.press(screen.getByText('A : Go B'));

    // The screen should be "B"
    expect(screen.queryByText('B title : vitest')).not.toBeNull();

    // Save the current route in variable
    const route = navigationRef.getCurrentRoute();

    // When the user presses the "B : Go Overlay" button
    await user.press(screen.getByText('B : Go Overlay'));

    // The screen should be "Overlay"
    expect(screen.queryByText('Overlay : title')).not.toBeNull();

    // And before screen is overlay, so the current route should be the same
    expect(screen.queryByText('B title : vitest')).not.toBeNull();
    expect(navigationRef.getCurrentRoute()?.key).toEqual(route?.key);

    // When the user presses the "Overlay : Close Overlay" button
    await user.press(screen.getByText('Overlay : Close Overlay'));

    // The screen should be "B", overlay is closed
    expect(screen.queryByText('Overlay : title')).toBeNull();
    expect(screen.queryByText('B title : vitest')).not.toBeNull();

    // When the user presses the "B : Go Overlay" button
    await user.press(screen.getByText('B : Go Back'));

    // Back to "A" Screen
    expect(screen.queryByText('B title : vitest')).toBeNull();
    expect(screen.queryByText('A : Go B')).not.toBeNull();

    // When the user presses the "A : Go C" button
    await user.press(screen.getByText('A : Go C'));

    // The screen should be "C"
    expect(screen.queryByText('C : Replace to B')).not.toBeNull();

    // When the user presses the "C : Replace to B" button
    await user.press(screen.getByText('C : Replace to B'));

    // replace to B Screen
    expect(screen.queryByText('B title : replace-test')).not.toBeNull();

    // When the user presses the "B : Go Back" button
    await user.press(screen.getByText('B : Go Back'));

    // Back to "A" Screen
    expect(screen.queryByText('B title : replace-test')).toBeNull();
    expect(screen.queryByText('A : Go B')).not.toBeNull();
  });

  test('The overlay should work even if there is no history', async () => {
    function NoHistoryOverlayTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        Overlay: {};
      }>({
        id: 'first-history-overlay-test',
        initial: {
          step: 'A',
          context: {},
        },
      });
      return (
        <funnel.Render
          A={({ history }) => (
            <View>
              <Button title="A : Go Overlay" onPress={() => history.push('Overlay')} />
            </View>
          )}
          Overlay={funnel.Render.overlay({
            render({ close }) {
              return (
                <View>
                  <Text>Overlay : title</Text>
                  <Button title="Overlay : Close Overlay" onPress={() => close()} />
                </View>
              );
            },
          })}
        />
      );
    }

    const navigationRef = createNavigationContainerRef();

    render(
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={NoHistoryOverlayTest} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    const user = userEvent.setup();

    // The first screen is "A"
    expect(screen.queryByText('A : Go Overlay')).not.toBeNull();

    // When the user presses the "A : Go Overlay" button
    await user.press(screen.getByText('A : Go Overlay'));

    // The screen should be "Overlay"
    expect(screen.queryByText('Overlay : title')).not.toBeNull();

    // When the user presses the "Overlay : Close Overlay" button
    await user.press(screen.getByText('Overlay : Close Overlay'));

    // The screen should be "A", overlay is closed
    expect(screen.queryByText('Overlay : title')).toBeNull();
    expect(screen.queryByText('A : Go Overlay')).not.toBeNull();
  });

  test('should work with sub funnel when is multiple used', async () => {
    function SubFunnel(props: { onNext(id: string): void }) {
      const funnel = useFunnel<{
        sub1: { id?: string };
        sub2: { id: string };
      }>({
        id: 'sub',
        initial: {
          step: 'sub1',
          context: {},
        },
      });
      return <funnel.Render
        sub1={({ history }) => <Button onPress={() => history.push('sub2', { id: 'SubId' })} title="Go to sub2" />}
        sub2={({ context }) => {
          return (
            <View>
              <Text>Your id is {context.id}?</Text>
              <Button title="OK" onPress={() => props.onNext(context.id)} />
            </View>
          );
        }}
      />
    }

    function MainFunnel() {
      const funnel = useFunnel<{
        main1: { id1?: string };
        main2: { id1: string; id2?: string };
        main3: { id1: string; id2?: string }
      }>({
        id: 'main',
        initial: {
          step: 'main1',
          context: {},
        },
      });

      return <funnel.Render
        main1={({ history }) => <SubFunnel onNext={(id) => history.push('main2', { id1: id })} />}
        main2={({ context, history }) => (
          <View>
            <Text>id1 is {context.id1}!</Text>
            {context.id2 == null ? (
              <Button title="set id2" onPress={() => history.push('main3')} />
            ) : (
              <Text>id2 is {context.id2}</Text>
            )}
          </View>
        )}
        main3={({ history }) => <SubFunnel onNext={(id) => history.push('main2', { id2: id })} />}
      />
    }

    const navigationRef = createNavigationContainerRef();

    render(
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={MainFunnel} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    // Main1/Sub1
    expect(screen.queryByText('Go to sub2')).not.toBeNull();

    const user = userEvent.setup();
    await user.press(screen.getByText('Go to sub2'));

    // Main1/Sub2
    expect(screen.queryByText('Your id is SubId?')).not.toBeNull();
    await user.press(screen.getByText('OK'));

    // Main2
    // expect(navigationRef.getCurrentRoute()?.params).not.toHaveProperty(['__useFunnelState', 'sub']);
    expect(screen.queryByText('id1 is SubId!')).not.toBeNull();
    expect(screen.queryByText('set id2')).not.toBeNull();
    await user.press(screen.getByText('set id2'));

    // Main3/Sub1
    expect(screen.queryByText('Go to sub2')).not.toBeNull();

    await user.press(screen.getByText('Go to sub2'));

    // Main3/Sub2
    expect(screen.queryByText('Your id is SubId?')).not.toBeNull();
    await user.press(screen.getByText('OK'));

    // Main2
    expect(screen.queryByText('id1 is SubId!')).not.toBeNull();
    expect(screen.queryByText('id2 is SubId')).not.toBeNull();
  })
});
