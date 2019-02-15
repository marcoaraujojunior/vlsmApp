var Subnet = /** @class */ (function () {
    function Subnet(hostsEachSubnet, majorNetwork) {
        this.networks = [];
        this.subnetCreated = 0;
        this.power = 0;
        this.majorNetworkPrefix = 0;
        this.hostsEachSubnet = hostsEachSubnet;
        this.majorNetwork = majorNetwork;
        this.needed = hostsEachSubnet.length + 1;
        this.doMath();
    }

    Subnet.prototype.getSubnetCreated = function(){
        return this.subnetCreated;
    };

    Subnet.prototype.isValid = function(){

        if (!this.isValidMajorNetwork())
            return false;

        return this.power <= (30 - this.majorNetworkPrefix);
    };

    Subnet.prototype.getNetworks = function(){
        return this.networks;
    }

    Subnet.prototype.isValidMajorNetwork = function(){
        ip = this.majorNetwork.split('/');

        if (!(ip.length == 2))
            return false;

        this.majorNetworkPrefix = parseInt(ip[1]);
        if (isNaN(this.majorNetworkPrefix))
            return false;

        ipOctets = ip[0].split('.');
        for (i in ipOctets) {
            ipOctets[i] = parseInt(ipOctets[i]);
            if (isNaN(ipOctets[i]))
                return false;
            
        }

        if (!(ipOctets.length == 4))
            return false;

        for (octet in ipOctets)
        {
            if (!(octet >= 0 && octet <= 255))
                return false;
        }
        return true;
    }

    Subnet.prototype.doMath = function(){
        if (!this.isValid())
            return;

        majorNetwork = this.majorNetwork;
        this.hostsEachSubnet = this.hostsEachSubnet.sort((a, b) => b - a);

        for (i in this.hostsEachSubnet)
        {
            hosts = this.hostsEachSubnet[i];
            network = new Network(hosts, majorNetwork);
            this.networks.push(network);
            prefix = network.getPrefix().toString();
            majorNetwork = network.getNextNetwork() + "/" + prefix;
        }

        while(true)
        {
            this.subnetCreated = parseInt(Math.pow(2, this.power));
            if (isNaN(this.subnetCreated) || this.needed <= this.subnetCreated)
                break;
            this.power++;
        }
    }

    return Subnet;
}());