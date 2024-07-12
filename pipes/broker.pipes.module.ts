import { NgModule } from '@angular/core';

import { PrettyNumberPipe } from './pretty-number.pipe';
import { TypeDocumentPipe } from './type-document.pipe';
import { FileNamePipe } from './file-name.pipe';
import { PrettyNumberPipeApVg } from './pretty-number-ap_vg.pipe';

@NgModule({
  declarations: [
    PrettyNumberPipe,
    TypeDocumentPipe,
    FileNamePipe,
    PrettyNumberPipeApVg,
  ],
  exports: [
    PrettyNumberPipe,
    TypeDocumentPipe,
    FileNamePipe,
    PrettyNumberPipeApVg,
  ]
})
export class BrokerPipesModule {}