# Clickr
This is an extremely heavyweight & overly simple autoclicker made in Electron (hence the filesize)

**The Code in this repository IS NOT good, I am pretty fucking terrible at programming in general. So instead of hating on it all, make a pull request and make it better :)** \

This project was started purely as a way for me to mess around with Electron, and to make an autoclicker that doesn't look like shit.

## Getting Started
If you want to install & use Clickr, then follow the instructions below to get everything running.

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
**The use of the [yarn](https://yarnpkg.com/) package manager is strongly recommended, as opposed to using `npm`.**

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

### Developing/Building on Ubuntu
**This section has only been tested using Ubuntu 18.04 Desktop**, other distributions will take a little tweaking for each thing listed below, I've included links to where your able to find install instructions for each dependency.

**Install the [Electron dependencies](https://www.electronjs.org/docs/development/build-instructions-linux) & [Git](https://git-scm.com/download/linux):**
```
sudo apt-get install git build-essential clang libdbus-1-dev libgtk-3-dev \ 
					 libnotify-dev libgnome-keyring-dev \ 
					 libasound2-dev libcap-dev libcups2-dev libxtst-dev \ 
					 libxss1 libnss3-dev gcc-multilib g++-multilib curl \ 
					 gperf bison python-dbusmock openjdk-8-jre
```

**Install [Yarn](https://classic.yarnpkg.com/en/docs/install) package manager:**
```sh
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn
```

**Install [Node.js](https://nodejs.org/en/download/package-manager/) v12:**
```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```


**Clone & Install:**
```sh
sudo git clone https://github.com/ImPhantom/Clickr.git && cd Clickr && sudo yarn
