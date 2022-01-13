# Clickr
This is a quite heavyweight (200MB+ installed, thanks electron), but undeniably good looking auto clicker.

***Why?***

This whole project started out with me just trying to learn new things, and for some reason I chose an auto-clicker. The first revision (0.x.x) was pretty terrible, but this most recent revision which I'm considering its first major release is much cleaner in looks and in logic. It also allowed me to get more familiar with webpack, and the build cycle in general.

### **Using:**
- [Electron Forge](https://www.electronforge.io/) (For building, packaging & webpack integration)
- [Tailwind](https://tailwindcss.com) (For easy to use styling utilities)
- [Nut.js](https://nutjs.dev/) (For accessing mouse functions cross platform)

## **Getting Started**
If you want to install & use Clickr, then follow the instructions below to get everything running.

### **Windows**
Installing on windows is as easy as it could ever be
- Download the latest `clickr_1.x.x_win64.exe` from the [releases page](https://github.com/ImPhantom/Clickr/releases/latest/)
- Run the installer, it should automatically install then open the application.

*(It will automatically create desktop & start menu shortcuts)*

### **Linux**
Currently there are only `.deb` builds, which to my knowledge can only be used on debian based linux distributions. *(I'm not great with linux, so I could totally be wrong)*

**Ubuntu/Debian:** (requires a graphical interface, obviously)
- Download the latest `clickr_1.x.x_amd64.deb` from the [releases page](https://github.com/ImPhantom/Clickr/releases/latest/)
- Then you just need to run ```sudo dpkg -i clickr_1.x.x_amd64.deb```

### **macOS**
I'm currently unable to create .dmg builds for macOS, I could package the application as a zip. But that definitely is not the most user friendly way to install an application on macOS.

If I end up getting my hands on a mac I'll release some builds, but for now if anyone wants to test building it on macOS, check out the "Contributing" section below.

### **If you run into any problems, please don't hesitate to [submit an issue](https://github.com/ImPhantom/Clickr/issues/new)**

## **Contributing**

If you would like to contribute to this repo, make a pull request from your branch to the `master` branch.\
*(Eventually I'll move to a more standard git flow, but for now everything is still kind of chaotic.)*

### **Environment/Build Prerequisites:**
- [Node.js](https://nodejs.org/en/) (latest, v16+)
- [Yarn](https://yarnpkg.com/) (strongly recommended over npm)
- [Electron Build Prerequisites](https://www.electronjs.org/docs/latest/development/build-instructions-gn)
	- Different for each platform, make sure your looking at the correct guide!

Once you've forked/cloned the repository, and installed the prerequisites listed above you should be able to navigate to the directory and run any of the following commands to run/build the application.
- `yarn install` **(Run this first, it will install all of the devDependencies)**
- `yarn start` (Starts the application in development mode)
- `yarn package` (Packages the application for your host platform/arch)
- `yarn make` (Makes installer(s) for your host platform/arch)