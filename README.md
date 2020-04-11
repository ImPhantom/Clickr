# Clickr
This is an extremely heavyweight & overly simple autoclicker made in Electron (hence the filesize)

**The Code in this repository IS NOT good, I am pretty fucking terrible at programming in general. So instead of hating on it all, make a pull request and make it better :)** \

This project was started purely as a way for me to mess around with Electron, and to make an autoclicker that doesn't look like shit.

## Getting Started
This application isn't currently in a state where it can be installed easily, eventually I will fill in the installation instructions and post releases in the release tab.
The use of the [yarn](https://yarnpkg.com/) package manager is **strongly** recommended, as opposed to using `npm`.

### Installing

#### Windows

* Download the [latest release](https://github.com/ImPhantom/Clickr/releases) from the 'Releases' section.
* Run the `clickr_0.x.x_installer_windows-x64.exe` to install the application.
* Application will be added to start menu shortcuts

*Application is installed in: `%appdata%/Local/Programs/clickr/`*

#### Linux
```bash
- May never be finished :P
```

#### OSX
```bash
- May never be finished :P
```

## Contributing
If you would like to contribute to this repo, just fork it and then make a pull request from your changed branch to the `master` branch.\
**Eventually I plan to move to a more standard git flow, but for now everything will be developed on master.**

#### Debugging in VSCode
If you are trying to debug this project via Visual Studio Code, please replace/add this to your `.vscode/launch.json`
```json
{
    "version": "0.2.0",
    "configurations": [{
        "name": "Debug Main Process",
        "type": "node",
        "request": "launch",
        "cwd": "${workspaceFolder}",
        "runtimeExecutable": "yarn",
        "windows": {
            "runtimeExecutable": "yarn"
        },
        "args": ["run", "dev"],
        "port": 5858,
        "outputCapture": "std"
    }]
}
```
