import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { NabtoDevice } from '../../app/device.class';
import { NabtoService } from '../../app/nabto.service';
import { DeviceSettingsPage } from '../device-settings/device-settings';

declare var NabtoError;

@Component({
  selector: 'page-mjpg-player',
  templateUrl: 'mjpg-player.html'
})
export class MjpgPlayerPage {
  
  device: NabtoDevice;
  busy: boolean;
  activated: boolean;
  offline: boolean;
  temperature: number;
  mode: string;
  roomTemperature: number;
  maxTemp: number;
  minTemp: number;
  timer: any;
  spinner: any;
  unavailableStatus: string;
  firstView: boolean = true;
  url: string;

  constructor(private navCtrl: NavController,
              private nabtoService: NabtoService,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private navParams: NavParams,
              private modalCtrl: ModalController) {
    this.device = navParams.get('device');
    this.temperature = undefined;
    this.activated = false;
    this.offline = true;
    this.mode = undefined;
    this.maxTemp = 30;
    this.minTemp = 16;
    this.timer = undefined;
    this.busy = false;
  }

  isOffline() {
    return this.offline;
  }
  
  ionViewDidLoad() {
    this.refresh();
  }
  
  ionViewDidEnter() {
    if (!this.firstView) {
      this.refresh();
    } else {
      // first time we enter the page, just show the values populated
      // during load (to not invoke device again a few milliseconds
      // after load)
      this.firstView = false;
    }
  }

  refresh() {
    this.busyBegin();
    // open tunnel
    this.nabtoService.openTunnel(this.device.id, 8081)
      .then((res: any) => {
        console.log(" *** tunnel connected, portnum is " + res.localPort + ", state is " + res.state);
        this.url = `http://127.0.0.1:${res.localPort}/`;
        this.offline = false;
        this.busyEnd();
      }).catch(error => {
        this.busyEnd();
        this.handleError(error);
      });
  }

  busyBegin() {
    if (!this.busy) {
      this.busy = true;
      this.timer = setTimeout(() => this.showSpinner(), 500);
    }
  }

  busyEnd() {
    this.busy = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (this.spinner) {
      this.spinner.dismiss();
      this.spinner = undefined;
    }
  }
  
  handleError(error: any) {
    console.log(`Handling error: ${error.code}`);
    if (error.code == NabtoError.Code.API_RPC_DEVICE_OFFLINE) {
      this.unavailableStatus = "Device offline";
      this.offline = true;
    } else {
      console.log("ERROR invoking device: " + JSON.stringify(error));
    }
    this.showToast(error.message);
  }

  showToast(message: string) {
    var opts = <any>{
      message: message,
      showCloseButton: true,
      closeButtonText: 'Ok',
      duration: 4000
    };
    let toast = this.toastCtrl.create(opts);
    toast.present();
  }
  
  showSpinner() {
    this.spinner = this.loadingCtrl.create({
      content: "Invoking device...",
    });
    this.spinner.present();
  }

  showSettingsPage() {
    this.navCtrl.push(DeviceSettingsPage, {
      device: this.device
    });
  }

  home() {
    this.navCtrl.popToRoot();
  }
  
}
