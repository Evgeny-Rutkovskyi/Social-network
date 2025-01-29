import { sizeFile } from "./sizeFile.util"


export const isPermissibleSize = (width: number, height: number, type: string, subspecies: string) => { 
    return  (width > sizeFile[type][`${subspecies}PV`].minWidth &&
            width < sizeFile[type][`${subspecies}PV`].maxWidth &&
            height > sizeFile[type][`${subspecies}PV`].minHeight &&
            height < sizeFile[type][`${subspecies}PV`].maxHeight
    )
}
