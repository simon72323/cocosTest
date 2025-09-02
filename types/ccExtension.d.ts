declare module 'cc' {

    interface Node {
        _gtTransformObject?: import('commonJs/helper/ccTools/useComponents').TransformObject;
        _gtOpacityObject?: import('commonJs/helper/ccTools/useComponents').OpacityObject;
        _clipName?: string;
    }
}
