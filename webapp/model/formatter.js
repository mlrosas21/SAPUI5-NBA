sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
	"use strict";
	return {
        chartValueTirosLibres: function(valor, total){
            return ((valor/total)*100)
        },
        chartValueDobles: function(valor, total){
            return (((valor*2)/total)*100)
        },
        chartValueTriples: function(valor, total){
            return (((valor*3)/total)*100)
        },
        porcentajeTirosLibres: function(valor, total){
            var oFloatFormat = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2});

            let porcentajeRaw = ((valor/total)*100)
            let porcentaje = oFloatFormat.format(porcentajeRaw)
            return porcentaje;
        },
        porcentajeDobles: function(valor, total){
            var oFloatFormat = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2});

            let porcentajeRaw = (((valor*2)/total)*100)
            let porcentaje = oFloatFormat.format(porcentajeRaw)
            return porcentaje;
        },
        porcentajeTriples: function(valor, total){
            var oFloatFormat = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2});

            let porcentajeRaw = (((valor*3)/total)*100)
            let porcentaje = oFloatFormat.format(porcentajeRaw)
            return porcentaje;
        },
	};
});