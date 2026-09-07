export function showAppNavigation(pathname:string,signedIn:boolean):boolean {
 return signedIn && ['/home','/people','/outings','/you','/mirror','/timeline'].some(route=>pathname===route||pathname.startsWith(route+'/'));
}
