import 'reflect-metadata';
// export function GitHubReleaseUrl(value: string) {
//   return function(target: Function) {
//     Reflect.defineMetadata('GitHubReleaseUrl', value, target);
//   };
// }

// private getDatabaseNameFromRepo() {
//     let value: string = Reflect.getMetadata(
//       'Database',
//       this.returnEntityInstance().constructor
//     );
//     if (value) {
//       return value.toLocaleLowerCase();
//     }
//     return value;
//   }
export const GITHUBURL_PROPERTY_DECORATOR_KEY = "GitHubReleaseUrl";
export const GitHubReleaseUrl = (value: string): PropertyDecorator => {
  return (target) => {
    var classConstructor = target.constructor;
    Reflect.defineMetadata(GITHUBURL_PROPERTY_DECORATOR_KEY, value, classConstructor);
  };
};
