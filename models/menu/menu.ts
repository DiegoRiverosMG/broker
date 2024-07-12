export class menu {
  NIDRESOURCE: number;
  NIDFATHER: number;
  SNAME: string;
  SDESCRIPTION: string;
  SHTML: string;
  SSTATE: string;
  DREGISTER: string;
  NUSERREGISTER: number;
  DUPDATE: Date;
  NUSERUPDATE: number;
  FATHER: menu;
  CHILDREN: menu[];
  STAG: string;
  NVALIDATE: number;
}
