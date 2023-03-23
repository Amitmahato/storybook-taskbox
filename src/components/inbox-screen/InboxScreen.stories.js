import React from "react";

import InboxScreen from "./InboxScreen";
import store from "../../lib/store";

import { rest } from "msw";
import { MockedState } from "../task-list/TaskList.stories";

import { Provider } from "react-redux";

import {
  fireEvent,
  within,
  waitFor,
  waitForElementToBeRemoved,
} from "@storybook/testing-library";

export default {
  component: InboxScreen,
  title: "InboxScreen",
  decorators: [(story) => <Provider store={store}>{story()}</Provider>],
};

const Template = () => <InboxScreen />;

export const Default = Template.bind({});
Default.parameters = {
  msw: {
    handlers: [
      /**
       * Notice the URL doesn't include the query parameter
       * Using the query parameter is not necessary, if used
       * `msw` will throw a warning to simply match against a
       * path instead and access query parameters in the response
       * resolver function using "req.url.userId"
       * */
      rest.get("https://jsonplaceholder.typicode.com/todos", (_, res, ctx) => {
        return res(ctx.json(MockedState.tasks));
      }),
    ],
  },
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  // Waits for the component to transition from the loading state
  await waitForElementToBeRemoved(await canvas.findByTestId("loading"));
  // Waits for the component to be updated based on the store
  await waitFor(async () => {
    // Simulates pinning the first task
    await fireEvent.click(canvas.getByLabelText("pinTask-1"));
    // Simulates pinning the third task
    await fireEvent.click(canvas.getByLabelText("pinTask-3"));
  });
};

export const Error = Template.bind({});
Error.parameters = {
  msw: {
    handlers: [
      rest.get("https://jsonplaceholder.typicode.com/todos", (_, res, ctx) => {
        return res(ctx.status(403));
      }),
    ],
  },
};
