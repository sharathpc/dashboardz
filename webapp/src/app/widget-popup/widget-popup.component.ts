import { Component, EventEmitter, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

import { WidgetService } from '../services';

@Component({
  selector: 'app-widget-popup',
  templateUrl: './widget-popup.component.html',
  styleUrls: ['./widget-popup.component.scss']
})
export class WidgetPopupComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  @Output() private event: EventEmitter<any> = new EventEmitter();
  isLoading: boolean = true;
  dimensionsList: any[] = [];
  modalRef!: BsModalRef;
  selectedChartType!: any;
  widgetForm: FormGroup = new FormGroup({
    name: new FormControl(null, Validators.required),
  });
  chertTypesList: any[] = [{
    label: 'Pie',
    refcode: 'PIECHART',
    controls: [{
      label: 'Label',
      key: 'label',
      type: 'DROPDOWN'
    }, {
      label: 'Value',
      key: 'value',
      type: 'DROPDOWN'
    }]
  }, {
    label: 'Bar',
    refcode: 'BARCHART',
    controls: [{
      label: 'X Axis',
      key: 'xaxis',
      type: 'DROPDOWN'
    }, {
      label: 'Y Axis',
      key: 'yaxis',
      type: 'DROPDOWN'
    }]
  }, {
    label: 'Line',
    refcode: 'LINECHART',
    controls: [{
      label: 'X Axis',
      key: 'xaxis',
      type: 'DROPDOWN'
    }, {
      label: 'Y Axis',
      key: 'yaxis',
      type: 'DROPDOWN'
    }]
  }]

  constructor(
    private modalService: BsModalService,
    private widgetService: WidgetService,
  ) { }

  ngOnInit(): void { }

  openWidgetPopup(_template: TemplateRef<any>) {
    this.isLoading = true;
    this.modalRef = this.modalService.show(_template, {
      ignoreBackdropClick: true,
      class: 'modal-dialog-centered widget-dialog'
    });
    this.widgetForm.reset();
    this.subscriptions.add(
      this.widgetService.getDimensions()
        .subscribe({
          next: response => this.dimensionsList = response,
          complete: () => this.isLoading = false,
        })
    );
  }

  selectChartType(_chartType: any): void {
    this.widgetForm.removeControl('mapping');
    let chartForm = new FormGroup({});
    _chartType.controls.forEach((control: any) => {
      const chartcontrol: any = new FormControl(null, Validators.required);
      chartcontrol.type = control.type;
      chartcontrol.label = control.label;
      chartForm.addControl(control.key, chartcontrol);
    });
    this.widgetForm.addControl('mapping', chartForm);
    this.selectedChartType = _chartType;
  }

  get mappingForm(): FormGroup {
    return this.widgetForm.get('mapping') as FormGroup;
  }

  addWidgetToLayout(): void {
    this.modalService.hide();
    this.event.emit({
      title: this.widgetForm.get('name')?.value,
      type: this.selectedChartType.refcode,
      mapping: this.mappingForm.value
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}