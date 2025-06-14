import '../styles/globals.css';
import { AppProviders } from '../components/shared/AppProviders';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <AppProviders>
        <div className="p-4">
          <Story />
        </div>
      </AppProviders>
    ),
  ],
};

export default preview;