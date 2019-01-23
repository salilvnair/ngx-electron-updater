import 'reflect-metadata';
export const URL_PROPERTY_DECORATOR_KEY = "ReleaseUrl";
export const ReleaseUrl = (value: string): PropertyDecorator => {
  return (target) => {
    var classConstructor = target.constructor;
    Reflect.defineMetadata(URL_PROPERTY_DECORATOR_KEY, value, classConstructor);
  };
};
