import 'reflect-metadata';
export const DLOAD_PROPERTY_DECORATOR_KEY = "DownloadPathSuffix";
export const DownloadPathSuffix = (value: string): PropertyDecorator => {
  return (target) => {
    var classConstructor = target.constructor;
    Reflect.defineMetadata(DLOAD_PROPERTY_DECORATOR_KEY, value, classConstructor);
  };
};