import 'reflect-metadata';
import { DownloadInfoType } from '../type/download.type';
export const DLOAD_PATH_PROPERTY_DECORATOR_KEY = "DownloadInfo";
export const DownloadInfo = (value: DownloadInfoType): PropertyDecorator => {
  return (target) => {
    var classConstructor = target.constructor;
    Reflect.defineMetadata(DLOAD_PATH_PROPERTY_DECORATOR_KEY, value, classConstructor);
  };
};