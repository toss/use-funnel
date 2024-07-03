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
});
