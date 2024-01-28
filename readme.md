# Time Suggest

![Screenthos showing and example of the addon](/static/example.png)

Time Suggest is a simple plugin to Google Calendar and Gmail that finds aviable timeslots in your calendar for you to suggest meetings during. Addon is still under development and hasn't been published to Google Workspace Marketplace. But feel free to clone the repo and install it yourself. It's working.

## Guide
To install the addon, you can clone this repo and enter your ScriptID manually in a `.clap-dev.json` file. And then push it with `npm run push`. This will build the the script and push it with clasp. 

Example .clasp-dev.json
```json
{
    "scriptId":"YOUR_SCRIP_ID",
    "rootDir":"./dist"
}
```

### Template
You can customize the snippet/output template with the help of two variables. The default template looks like this, you'll figure it out.

```
Would {{duration}} min work during any of these times?

{{suggestion_list}}
```

