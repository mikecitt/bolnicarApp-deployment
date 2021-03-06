import { Component, OnInit, Directive, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { Subject, Observable, Subscription, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { PatientService, Appointment, AppointmentService } from '../service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClinicCardComponent } from '../clinic-card/clinic-card.component';
import { NgSortableHeader, SortDirection, SortEvent, compare } from '../sortable-table';

export type SortColumn = keyof Appointment | '';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.component.html',
  styleUrls: ['./appointment-history.component.css']
})
export class AppointmentHistoryComponent implements OnInit {
  tableData: Appointment[] = []

  @ViewChildren(NgSortableHeader) headers: QueryList<NgSortableHeader>;

  constructor(private patientService: PatientService, private appointmentService: AppointmentService, private modalService: NgbModal) { }

  ngOnInit(): void {
  	this.patientService.getAppointmentsHistory().subscribe(data => {
  		for (let d of data['data']) {
        d.type = d.type.name; // use just name
        this.tableData.push(d);
      }
  	})
  }

  onSort({column, direction}: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting tableData
    if (direction === '' || column === '') {
      this.tableData = this.tableData;
    } else {
      this.tableData = [...this.tableData].sort((a, b) => {
        let res = 0;
        if (typeof(a[column]) === 'number' && typeof(b[column]) === 'number')
          res = compare(a[column], b[column]);
        else
          res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }

  }

  gradeAppointment(grade, entity) {
    this.appointmentService
    .gradeAppointment({ entityId: entity.id, grade: grade})
    .subscribe((data) => {
    },
    error => {
      console.error('something went wrong with grading system')
    })
  }

  openClinicCard(clinicId): void {
    console.log(clinicId)
    const modalRef = this.modalService.open(ClinicCardComponent, { size: 'sm' });
    modalRef.componentInstance.fillClinic(clinicId);
  }
}