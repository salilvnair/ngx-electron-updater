import 'reflect-metadata';
import { ReleaseInfoType } from '../type/release.type';
export const URL_PROPERTY_DECORATOR_KEY = "Release";
export const Release = (value: ReleaseInfoType): PropertyDecorator => {
  return (target) => {
    var classConstructor = target.constructor;
    Reflect.defineMetadata(URL_PROPERTY_DECORATOR_KEY, value, classConstructor);
  };
};
