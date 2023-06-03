import { html } from 'lit';
import '../src/roamr-app.js';

export default {
  title: 'RoamrApp',
  component: 'roamr-app',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

function Template({ header, backgroundColor }) {
  return html`
    <roamr-app
      style="--roamr-app-background-color: ${backgroundColor || 'white'}"
      .header=${header}
    >
    </roamr-app>
  `;
}

export const App = Template.bind({});
App.args = {
  header: 'My app',
};
