export class AccessFilter {
    /**
     * Verificar si el usuario tiene acceso a la vista indicada.
     * @param viewId Id de vista a la que se debe acceder.
     */
    static hasPermission(viewId: string): boolean {
        let permissionList = JSON.parse(localStorage.getItem("currentUser"))["permissionList"];
        for (let i = 0; i < permissionList.length; i++) {
            if (permissionList[i].id == viewId) return true;
        }
        return false;
    }
}
