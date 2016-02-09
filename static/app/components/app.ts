import {Component, View} from "angular2/core";
import {Http, HTTP_PROVIDERS} from "angular2/http";
import { CORE_DIRECTIVES } from 'angular2/common';
import _ from "lodash";
import { Alert /*, TAB_DIRECTIVES*/ } from 'ng2-bootstrap/ng2-bootstrap';

import 'rxjs/add/operator/map';

@Component({
	selector: 'my-app',
	directives: [CORE_DIRECTIVES/*, TAB_DIRECTIVES*/, Alert],
	viewProviders: [HTTP_PROVIDERS],
	templateUrl: '/app/views/app.html'
})
export class AppComponent {
	processes: Array<any> = [];
    stopped: number = 0;
    running: number = 0;
    total: number = 0;
    _isBusy: number = 0;
    busyIndicator = null;
    autoRefresh: boolean = true;
    
    alerts:Array<Object> = [];

    get isBusy() {
        return this._isBusy;
    }
    
    set isBusy(value) {
        this._isBusy = value;
        
        if(value > 0) {
            if(this.busyIndicator){
                this.busyIndicator.style.display = "block";
            }
        } else {
            setTimeout(() => {
                if(this.busyIndicator){
                    this.busyIndicator.style.display = "none";
                }
            }, 500);
        }
    }

	constructor(private http: Http) {
        this.busyIndicator = document.getElementById("busy-indicator");
        
        this.updateProcesses();

		setInterval(() => {
            if(this.autoRefresh) {
                this.updateProcesses();
            }
        }, 5000);
	}
    
    closeAlert(i:number) {
        this.alerts.splice(i, 1);
    }
    
    updateProcesses() {
        this.isBusy++;
        
        this.http.get('/api/processinfo')
			.map(res => res.json())
			.subscribe((data) => {
				this.processes = data.result;
                
                this.running = _.filter(this.processes, (process) => {
                    return process.statename === "RUNNING";
                }).length;
                
                this.stopped = _.filter(this.processes, (process) => {
                    return process.statename !== "RUNNING";
                }).length;
                
                //console.dir(this.processes);
                this.isBusy--;
                
                // this.alerts.push({
                //     type: 'success',
                //     msg: 'Process list updated.',
                //     closable: true
                // });
			});
    }
    
    readLog(processName: string) {
        this.isBusy++;
        
        this.http.get('/api/' + processName + '/readlog')
			.map(res => res.json())
			.subscribe((data) => {
                this.isBusy--;
			});
    }
    
    stop(processName: string) {
        this.isBusy++;
        
        this.http.get('/api/' + processName + '/stop')
			.map(res => res.json())
			.subscribe((data) => {                
                this.isBusy--;
                
                this.alerts.push({
                    type: 'success',
                    msg: 'Process "' + processName + '" stopped.',
                    closable: true
                });
                
                this.updateProcesses();
			});
    }
    
    start(processName: string) {
        this.isBusy++;
        
        this.http.get('/api/' + processName + '/start')
			.map(res => res.json())
			.subscribe((data) => {                
                this.isBusy--;
                
                this.alerts.push({
                    type: 'success',
                    msg: 'Process "' + processName + '" started.',
                    closable: true
                });
                
                this.updateProcesses();
			});
    }
    
    stopAll() {
        this.isBusy++;
        
        this.http.get('/api/stopall')
			.map(res => res.json())
			.subscribe((data) => {                
                this.isBusy--;
                
                this.alerts.push({
                    type: 'success',
                    msg: 'All processes stopped.',
                    closable: true
                });
                
                this.updateProcesses();
			});
    }
    
    startAll() {
        this.isBusy++;
        
        this.http.get('/api/startall')
			.map(res => res.json())
			.subscribe((data) => {                
                this.isBusy--;
                
                this.alerts.push({
                    type: 'success',
                    msg: 'All processes started.',
                    closable: true
                });
                
                this.updateProcesses();
			});
    }
}
