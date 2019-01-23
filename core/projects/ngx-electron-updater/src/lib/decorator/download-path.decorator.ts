import 'reflect-metadata';
export const DLOAD_PATH_PROPERTY_DECORATOR_KEY = "DownloadPath";
export const DownloadPath = (value: string): PropertyDecorator => {
  return (target) => {
    var classConstructor = target.constructor;
    Reflect.defineMetadata(DLOAD_PATH_PROPERTY_DECORATOR_KEY, value, classConstructor);
  };
};