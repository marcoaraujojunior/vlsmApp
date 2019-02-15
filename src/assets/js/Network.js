var Network = /** @class */ (function () {
    function Network(size, majorNetwork) {
        this.size = size;
        this.majorNetwork = majorNetwork;
        this.power = 0;
        this.prefix = 32;
        this.allocatedSize = 0;
        this.netWorkMultiplie = 1;
        this.majorNetworkPrefix = 0;
        this.ipOctets;
        this.octetIndex;
        this.doMath();
    }

    Network.prototype.getNeededSize = function(){return this.size;};

    Network.prototype.getAllocatedSize = function(){return this.allocatedSize;};

    Network.prototype.getPrefix = function(){return this.prefix;};

    Network.prototype.getNetworkMultiple = function(){return this.netWorkMultiplie;};

    Network.prototype.getMask = function(){return 256 - this.getNetworkMultiple();};

    Network.prototype.getMajorNetworkPrefix = function(){return this.majorNetworkPrefix;};

    Network.prototype.getSubnetMask = function(){
        if (this.getPrefix() < 9)
            return this.getMask().ToString() + ".0.0.0";

        if (this.getPrefix() < 17)
            return "255." + this.getMask().toString() + ".0.0";

        if (this.getPrefix() < 25)
            return "255.255." + this.getMask().toString() + ".0";

        return "255.255.255." + this.getMask().toString();
    }

    Network.prototype.getNetwork = function(){
        if (!this.isValidMajorNetwork())
            return "";

        if (this.majorNetworkPrefix > 0 && this.majorNetworkPrefix <= 8)
            return this.ipOctets[0].toString() + ".0.0.0";

        if (this.majorNetworkPrefix <= 16)
            return this.ipOctets.slice(0, 2).join(".") + ".0.0";

        if (this.majorNetworkPrefix <= 24)
            return this.ipOctets.slice(0, 3).join(".") + ".0";

        return this.ipOctets.join(".");
    }

    Network.prototype.getNextNetwork = function(){
        network = this.getNetwork().split('.');

        if (this.getPrefix() > 0 && this.getPrefix() <= 8)
            this.octetIndex = 0;

        if (this.getPrefix() > 8 && this.getPrefix() <= 16)
            this.octetIndex = 1;

        if (this.getPrefix() > 16 && this.getPrefix() <= 24)
            this.octetIndex = 2;

        if (this.getPrefix() > 24)
            this.octetIndex = 3;

        network[this.octetIndex] = (parseInt(network[this.octetIndex]) + this.netWorkMultiplie).toString();
        return network.join(".");
    }

    Network.prototype.getBroadcast = function(){
        broadcast = this.ipToInt(this.getNextNetwork());
        broadcast[this.octetIndex]--;

        if (this.octetIndex > 0 && this.octetIndex < 3) {
            for (i = this.octetIndex + 1; i <= 3; i++) {
                if (broadcast[i] == 0)
                    broadcast[i] = 255;
                else
                    broadcast[i]--;
            }
        }

        return broadcast.join(".");
    }

    Network.prototype.getFirstIP = function(){
        ip = this.ipToInt(this.getNetwork());
        ip[3]++;
        return ip.join(".");
    }

    Network.prototype.getLastIP = function(){
        ip = this.ipToInt(this.getBroadcast());
        ip[3]--;
        return ip.join(".");
    }

    Network.prototype.doMath = function () {
        if (this.size < 2)
            return;
        if (!this.isValidMajorNetwork())
            return;

        while (true) {
            this.allocatedSize = parseInt(Math.pow(2, this.power));
            if (this.size <= this.allocatedSize - 2)
                break;
            this.power++;
            this.prefix--;
            this.netWorkMultiplie = this.netWorkMultiplie * 2;
            if (this.netWorkMultiplie > 128)
                this.netWorkMultiplie = 1;
        }
    };

    Network.prototype.ipToInt = function(ip) {
        octet = ip.split('.');
        for (i in octet) {
            octet[i] = parseInt(octet[i]);
        }
        return octet;
    };

    Network.prototype.isValidMajorNetwork = function () {
        ip = this.majorNetwork.split('/');
        
        if(!(ip.length == 2))
            return false;
        
        this.ipOctets = this.ipToInt(ip[0]);

        this.majorNetworkPrefix = parseInt(ip[1]);

        if (!(this.ipOctets.length == 4))
            return false;

        for(octet in this.ipOctets)
        {
            if (!(this.ipOctets[octet] >= 0 && this.ipOctets[octet] <= 255))
                return false;
        }
        return true;
    };
    return Network;
}());