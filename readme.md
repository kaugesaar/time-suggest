# Time Suggest

![Screenthos showing and example of the addon](/static/example.png)

Time Suggest is a simple plugin for Google Calendar and Gmail that finds available time slots in your calendar for you to suggest meeting times. The add-on is still under development and has not been published to the Google Workspace Marketplace. However, feel free to clone the repository and install it yourself.

## Guide
To install the add-on, clone this repository and manually enter your ScriptID in a `.clasp-dev.json` file. Then, deploy it using `npm run push`. This command will build the script with [rollup.js](https://github.com/rollup/rollup) and deploy it using [clasp](https://github.com/google/clasp).

Example of a .clasp-dev.json file:
```json
{
    "scriptId":"YOUR_SCRIP_ID",
    "rootDir":"./dist"
}
```

### Template
Customize the snippet/output template using two variables. The default template is as follows, and you can modify it as needed:

```
Would {{duration}} min work during any of these times?

{{suggestion_list}}
```

