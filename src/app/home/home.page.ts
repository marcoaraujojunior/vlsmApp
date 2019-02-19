declare var Network;
declare var Subnet;

import { Component, Input, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ThemeService } from '../theme.service';

const themes = {
  day: {
    primary: '#3880ff',
    secondary: '#0cd1e8',
    tertiary: '#7044ff',
    medium: '#3880ff',
    dark: '#f4f5f8',
    light: '#f4f5f8'
  },
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

    masks: any;

    inputs = [];
    results = [];
    activeTheme = '';
    @ViewChild('numSubnet') numSubnet ;
    @ViewChild('majorNetwork') majorNetwork ;

    constructor(public toastController: ToastController, private theme: ThemeService) {
        this.masks = {
            ipAddress: {
                mask: 'AAA.BBB.CCC.DDD/EE',
                blocks: {
                    AAA: {
                        mask: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
                    },
                    BBB: {
                        mask: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
                    },
                    CCC: {
                        mask: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
                    },
                    DDD: {
                        mask: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
                    },
                    EE: {
                        mask: IMask.MaskedRange,
                        from: 1,
                        to: 30,
                    },
                }
            }
        };
    }

    async presentToast(message) {
        const toast = await this.toastController.create({
            message: message,
            showCloseButton: true,
            position: 'top',
            closeButtonText: 'Done'
        });
        toast.present();
    }

    searchSize(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].size === nameKey) {
                return myArray[i];
            }
        }
    }

    toggleTheme() {
        let name = this.activeTheme == '' ? 'day' : '';
        this.activeTheme = name;
        this.theme.setTheme(themes[name]);
    }

    resetCalc(){
        this.results = [];
        this.inputs = [];
        this.majorNetwork.value = "";
        this.numSubnet.value = "";
    }

    addSubnets() {
        this.results = [];
        this.inputs = [];
        let size = parseInt(this.numSubnet.value);
        if (isNaN(size) || size <= 0) {
            return;
        }
        for(let i of (new Array(size))){
            this.inputs.push({name: '', size: ''});
        }
    }

    calc(){
        if(!this.validate()){
            return;
        }

        let inputs = Object.assign([], this.inputs);
        let subnets = [];

        for(let subnet of inputs){
            subnets.push(subnet.size);
        }

        let oSubnet = new Subnet(subnets, this.majorNetwork.value);

        if (!oSubnet.isValid()) {
            this.presentToast("Invalid Data!");
            return;
        }

        this.inputs = [];

        for(let subnet of oSubnet.getNetworks()){
            let input = this.searchSize(subnet.getNeededSize(), inputs);
            let result = {
                'Name': input.name,
                'Size': subnet.getNeededSize(),
                'Network': subnet.getNetwork(),
                'FirstIP': subnet.getFirstIP(),
                'LastIP': subnet.getLastIP(),
                'Broadcast': subnet.getBroadcast(),
                'Mask': subnet.getSubnetMask()
            };
            this.results.push(result);
        }
    }

    showSizes(){
        return this.inputs.length > 0;
    }

    showSubnets(){
        return this.results.length > 0;
    }

    validate(){
        let errorFound = false;
        let errorMessage = [];

        if (this.majorNetwork.value == "") {
            this.majorNetwork.setFocus();
            this.presentToast("Major Network Required!");
            return false;
        }
        if (this.numSubnet.value == "") {
            this.numSubnet.setFocus();
            this.presentToast("Number of Subnets Required!");
            return false;
        }
        if (this.inputs.length < 1) {
            this.numSubnet.setFocus();
            this.presentToast("None subnets listed!");
            return false;
        }
        for (var i=0; i < this.inputs.length; i++) {
            if (this.inputs[i].size == "") {
                errorFound = true;
                errorMessage.push(this.inputs[i].name + " Subnet's size required!" );
                break;
            }
            if (this.inputs[i].size < 2) {
                errorFound = true;
                errorMessage.push(this.inputs[i].name + " Subnet's size must be greater than or equal to 2!" );
            }
        }
        if (errorFound) {
            this.presentToast(errorMessage.join("\n"));
            return false;
        }

        return true;
    }
}
