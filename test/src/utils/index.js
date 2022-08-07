import { createApp } from "vue";

export const mountComponent = async (component, element) => {
  if (element === undefined) return;
  element =
    typeof element === "string" ? document.querySelector(element) : element;
  const example = createApp(component).mount(document.createElement("div"));
  element.appendChild(example.$el);
};
