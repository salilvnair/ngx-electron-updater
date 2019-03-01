import 'reflect-metadata';
import { ReleaseInfoType } from '../type/release-info.type';
export const URL_PROPERTY_DECORATOR_KEY = "ReleaseInfo";
export const ReleaseInfo = (value: ReleaseInfoType): PropertyDecorator => {
  return (target) => {
    var classConstructor = target.constructor;
    Reflect.defineMetadata(URL_PROPERTY_DECORATOR_KEY, value, classConstructor);
  };
};
