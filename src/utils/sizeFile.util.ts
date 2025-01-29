//P - photo, V - video
export const sizeFile = {
    stories: {
        sizePV: {
            minWidth: 320,
            minHeight: 568,
            maxWidth: 3840,
            maxHeight: 2160,
            standardWidth: 1080,
            standardHeight: 1920,
        }
    },
    post: {
        squarePV: {
            minWidth: 320,
            minHeight: 320,
            maxWidth: 1080,
            maxHeight: 1080,
            standardWidth: 1080,
            standardHeight: 1080,
        },
        portraitPV: {
            minWidth: 320,
            minHeight: 400,
            maxWidth: 1080,
            maxHeight: 1350,
            standardWidth: 1080,
            standardHeight: 1350,
        },
        landscapePV: {
            minWidth: 320,
            minHeight: 168,
            maxWidth: 1080,
            maxHeight: 608,
            standardWidth: 1080,
            standardHeight: 608,
        }
    }
}