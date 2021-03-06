import { Component, OnInit, Input, PipeTransform } from '@angular/core';
import { DoctorService, ToastService } from '../service';
import { DecimalPipe } from '@angular/common';
import { FormControl } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface Doctor {
	id: string;
	firstName: string;
	lastName: string;
	jmbg: string;
	emailAddress: string;
}

function search(text: string, pipe: PipeTransform, data: Doctor[]): Doctor[] {
  return data.filter(doctor => {
    const term = text.toLowerCase();
    return doctor.firstName.toLowerCase().includes(term)
				|| doctor.emailAddress.toLowerCase().includes(term)
				|| doctor.jmbg.toLowerCase().includes(term)
        || doctor.lastName.toLowerCase().includes(term);
  });
}

@Component({
  selector: 'app-doctors-table',
  templateUrl: './doctors-table.component.html',
  styleUrls: ['./doctors-table.component.css'],
  providers: [DecimalPipe]
})
export class DoctorsTableComponent implements OnInit {
	@Input() endpoint: string;
	@Input() fieldsList: string[];

  private eventsSubscription: Subscription;

  @Input() events: Observable<void>;

	data: Doctor[] = [];
  tableData: Doctor[] = [];

	doctors: Observable<Doctor[]>;
	filter = new FormControl('');

	pipe: DecimalPipe;

  constructor(private doctorService: DoctorService, pipe: DecimalPipe,
							private toastService: ToastService) {
  	this.pipe = pipe;

    this.filter.valueChanges.subscribe(val => {
      this.tableData = this.data.filter(entity => {
        const term = val.toLowerCase();
        return entity.firstName.toLowerCase().includes(term)
					|| entity.emailAddress.toLowerCase().includes(term)
					|| entity.jmbg.toLowerCase().includes(term)
          || entity.lastName.toLowerCase().includes(term);
      })
    })
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  ngOnInit(): void {
  	this.initTable();
    this.eventsSubscription = this.events.subscribe(() => this.initTable());
  }

  initTable(): void {
    this.data.length = 0;
    this.tableData.length = 0;
    this.filter.setValue('');
    this.doctorService.getDoctors().subscribe(data => {
      for (let e in data)
        this.data.push({id: data[e].id, firstName: data[e].firstName, jmbg: data[e].jmbg, emailAddress: data[e].emailAddress, lastName: data[e].lastName});

      // why not in constructor?
      //  this.doctors = this.filter.valueChanges.pipe(
      //    startWith(''),
      //    map(text => search(text, this.pipe, this.data))
      //  )
        this.tableData = this.data
    })
  }

	removeDoctor(id) {
		console.log(id);
		this.doctorService.removeDoctor(id).subscribe(data => {
			this.toastService.show('Brisanje uspešno.', { classname: 'bg-success text-light', delay: 3000 });
			this.initTable();
		}, err => {
			this.toastService.show('Nije moguće obrisati stavku.', { classname: 'bg-danger text-light', delay: 3000 });
		});
	}

}
