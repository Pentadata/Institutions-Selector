# Institutions Search Widget Template

The code in this repository is a HTML/JS template of a web widget that allows users to select and search financial institutions before linking their accounts.

The code is free to use, modify and sell, under the MIT license.


**Files**

- `index.html`, plug-and-play UI widget to select and search institutions.
- `script.js`, functions to display data and send requests to backend.


**Assumptions**

To build this template, we'd to make some assumptions about how your app works. To make changes, edit the `script.js` file.

- The widget sends requests to a backend app, which in turn send requests to the Pentadata API.
- The widget always shows some of the top-US banks as default choices.
- To display different choices, the widget has a search option that requests an updated list to the backend app.
- Authentication between widget and backend app is via Bearer token.
