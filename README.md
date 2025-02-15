# @use-funnel

<div align="center">
  <a href="https://use-funnel.slash.page" title="@use-funnel - A powerful and safe step-by-step state management library">
    <img src="./docs/public/logo.png" width="200" />
    <h2 align="center">@use-funnel</h2>
  </a>
  <p style="font-size:18px;">A powerful and safe step-by-step state management library</p>
</div>

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/toss/use-funnel/blob/main/LICENSE) [![Discord Badge](https://discord.com/api/guilds/1281071127052943361/widget.png?style=shield)](https://discord.gg/vGXbVjP2nY)

`@use-funnel` is a [React Hook](https://react.dev/reference/rules/rules-of-hooks) that helps you easily implement complex UI flows.

## Core Concepts

### Strong Type Support

By comparing the type of the current step with the next, you can ensure that only the required states are managed safely.

### State Management by History

Manage states based on history, making it easy to handle backward and forward navigation.

### Various Router Support

Supports browser history, react-router, next.js, @react-navigation/native, and more.

## Example

https://github.com/user-attachments/assets/8300d4ed-ab02-436e-a5a6-99c8d732e32f

```tsx
import { useFunnel } from '@use-funnel/browser';

export function App() {
  const funnel = useFunnel<{
    SelectJob: { jobType?: 'STUDENT' | 'EMPLOYEE' };
    SelectSchool: { jobType: 'STUDENT'; school?: string };
    SelectEmployee: { jobType: 'EMPLOYEE'; company?: string };
    EnterJoinDate: { jobType: 'STUDENT'; school: string } | { jobType: 'EMPLOYEE'; company: string };
    Confirm: ({ jobType: 'STUDENT'; school: string } | { jobType: 'EMPLOYEE'; company: string }) & { joinDate: string };
  }>({
    id: 'hello-world',
    initial: {
      step: 'SelectJob',
      context: {},
    },
  });

  return (
    <funnel.Render
      SelectJob={funnel.Render.with({
        events: {
          selectSchool: (_, { history }) => history.push('SelectSchool', { jobType: 'STUDENT' }),
          selectEmployee: (_, { history }) => history.push('SelectEmployee', { jobType: 'EMPLOYEE' }),
        },
        render({ dispatch }) {
          return (
            <SelectJob
              onSelectSchool={() => dispatch('selectSchool')}
              onSelectEmployee={() => dispatch('selectEmployee')}
            />
          );
        },
      })}
      SelectSchool={({ history }) => (
        <SelectSchool
          onNext={(school) =>
            history.push('EnterJoinDate', (prev) => ({
              ...prev,
              school,
            }))
          }
        />
      )}
      SelectEmployee={({ history }) => (
        <SelectEmployee
          onNext={(company) =>
            history.push('EnterJoinDate', (prev) => ({
              ...prev,
              company,
            }))
          }
        />
      )}
      EnterJoinDate={funnel.Render.overlay({
        render({ history, close }) {
          return (
            <EnterJoinDateBottomSheet
              onNext={(joinDate) => history.push('Confirm', { joinDate })}
              onClose={() => close()}
            />
          );
        },
      })}
      Confirm={({ context }) =>
        context.jobType === 'STUDENT' ? (
          <ConfirmStudent school={context.school} joinDate={context.joinDate} />
        ) : (
          <ConfirmEmployee company={context.company} joinDate={context.joinDate} />
        )
      }
    />
  );
}

declare function SelectJob(props: { onSelectSchool(): void; onSelectEmployee(): void }): JSX.Element;
declare function SelectSchool(props: { onNext(school: string): void }): JSX.Element;
declare function SelectEmployee(props: { onNext(company: string): void }): JSX.Element;
declare function EnterJoinDateBottomSheet(props: { onNext(joinDate: string): void; onClose(): void }): JSX.Element;
declare function ConfirmStudent(props: { school: string; joinDate: string }): JSX.Element;
declare function ConfirmEmployee(props: { company: string; joinDate: string }): JSX.Element;
```

## Visit [use-funnel.slash.page](https://use-funnel.slash.page) for docs, guides, API and more!

[English](https://use-funnel.slash.page/en) | [한국어](https://use-funnel.slash.page/ko)

## Contributing

Read our [Contributing Guide](./CONTRIBUTING.md) to familiarize yourself with `@use-funnel` development process, how to suggest bug fixes and improvements, and the steps for building and testing your changes.

<a title="Toss" href="https://toss.im">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://static.toss.im/logos/png/4x/logo-toss-reverse.png">
    <img alt="Toss" src="https://static.toss.im/logos/png/4x/logo-toss.png" width="100">
  </picture>
</a>

MIT © Viva Republica, Inc. See [LICENSE](./LICENSE) for details.
