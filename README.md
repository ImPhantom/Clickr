# Clickr

## Getting Started
This application isn't currently in a state where it can be installed easily, eventually I will fill in the installation instructions and post releases in the release tab.
The use of the [yarn](https://yarnpkg.com/) package manager is **strongly** recommended, as opposed to using `npm`.

### Installing
```bash
-Soon-
```

### Debugging in VSCode

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
