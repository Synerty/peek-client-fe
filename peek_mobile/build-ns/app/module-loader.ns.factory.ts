import {
    Compiler,
    Injectable,
    NgModuleFactory,
    NgModuleFactoryLoader,
SystemJsNgModuleLoader
} from "@angular/core";

import {knownFolders, path} from "file-system";

// const SEPARATOR = "#";
//
//
// @Injectable()
// export class PeekModuleFactoryLoader implements NgModuleFactoryLoader {
//
//     constructor(private compiler: Compiler) {
//     }
//
//     load(path: string): Promise<NgModuleFactory<any>> {
//         let {modulePath, exportName} = this.splitPath(path);
//
//         let loadedModule = require(modulePath)[exportName];
//         if (!loadedModule) {
//             throw new Error(`Cannot find "${exportName}" in "${modulePath}"`);
//         }
//
//         return this.compiler.compileModuleAsync(loadedModule);
//     }
//
//     private splitPath(path: string): { modulePath: string, exportName: string } {
//         let [modulePath, exportName] = path.split(SEPARATOR);
//         modulePath = getAbsolutePath(modulePath);
//
//         if (typeof exportName === "undefined") {
//             exportName = "default";
//         }
//
//         return {modulePath, exportName};
//     }
// }
//
// function getAbsolutePath(relativePath: string) {
//     return path.normalize(path.join(knownFolders.currentApp().path, relativePath));
// }


let SEPARATOR = "#";

@Injectable()
export class PeekModuleFactoryLoader implements NgModuleFactoryLoader {

    private offlineMode:boolean;

    constructor(private compiler:Compiler, private ngModuleLoader:SystemJsNgModuleLoader) {
        this.offlineMode = compiler instanceof Compiler;
    }

    load(path) {
        if (this.offlineMode) {
            return this.ngModuleLoader.load(path);
        }
        else {
            return this.loadAndCompile(path);
        }
    }

    loadAndCompile(path) {
        let {modulePath, exportName} = this.splitPath(path);

        let loadedModule = global.require(modulePath)[exportName];
        this.checkNotEmpty(loadedModule, modulePath, exportName);
        return Promise.resolve(this.compiler.compileModuleAsync(loadedModule));
    };


    private splitPath(path) {
        let a = path.split(SEPARATOR);
        let modulePath = a[0];
        let exportName = a[1];

        modulePath = this.getAbsolutePath(modulePath);

        if (typeof exportName === "undefined") {
            exportName = "default";
        }

        return {modulePath: modulePath, exportName: exportName};
    }

    private  getAbsolutePath(relativePath) {
        return path.normalize(path.join(knownFolders.currentApp().path, relativePath));
    }

    private  checkNotEmpty(value, modulePath, exportName) {
        if (!value) {
            throw new Error("Cannot find '" + exportName + "' in '" + modulePath + "'");
        }
        return value;
    }

}