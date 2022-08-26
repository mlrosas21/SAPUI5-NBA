sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "sap/ui/core/Fragment",
    'sap/ui/Device', 
    'sap/ui/model/Filter',
    'sap/ui/model/Sorter',
    "sap/ui/core/UIComponent",
    'sap/ui/export/Spreadsheet',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, Fragment,  Device, Filter, Sorter, UIComponent, Spreadsheet) {
        "use strict";

        return Controller.extend("academia2022.znba.controller.Equipos", {
            onInit: function () {
                // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
                this._mViewSettingsDialogs = {};
            },
            onToggleHeader: function() {
                this.getPage().setHeaderExpanded(!this.getPage().getHeaderExpanded());
            },


            /* ---------------------------------------------------------------------------------------------------------*/

            // ORDENAMIENTO
            handleSortButtonPressed: function () {
                this.getViewSettingsDialog("SortDialog")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            },

            handleSortDialogConfirm: function (oEvent) {
                var oTable = this.byId("idTablaListaJugadores"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorters = [];

                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));

                // apply the selected sort and group settings
                oBinding.sort(aSorters);
            },
            getViewSettingsDialog: function (sDialogFragmentName) {
                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
    
                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: "academia2022.znba.view.fragments." + sDialogFragmentName,
                        controller: this
                    }).then(function (oDialog) {
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                    this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog;
            },

            /* ---------------------------------------------------------------------------------------------------------*/

            // NAVEGACIÓN JUGADOR
            onPlayerPress: function(oEvent){
                let jugador = oEvent.getSource().getBindingContext().getObject();
                let oRouter = UIComponent.getRouterFor(this)
    
                oRouter.navTo("RouteJugador", {
                    NombreEquipo: jugador.NombreEquipo, 
                    Dorsal: jugador.Dorsal
                })
            },

            /* ---------------------------------------------------------------------------------------------------------*/

            // Exportar plantilla a Excel
            createColumnConfig: function() {
                var aCols = [];

                aCols.push({
                    label: 'Equipo',
                    property: 'NombreEquipo',
                });

                aCols.push({
                    label: '# Dorsal',
                    property: 'Dorsal',
                    scale: 0
                });

                aCols.push({
                    label: 'Nombre',
                    property: 'Nombre',
                });

                aCols.push({
                    label: 'Apellido',
                    property: 'Apellido',
                });

                aCols.push({
                    label: 'Posición',
                    property: 'PosicionDesc',
                });

                aCols.push({
                    label: 'Partidos Jugados',
                    property: 'PartidosJugados',
                });

                aCols.push({
                    label: 'Puntos',
                    property: 'Puntos',
                });

                aCols.push({
                    label: 'Puntos por partido',
                    property: 'PPG',
                });

                aCols.push({
                    label: 'Dobles',
                    property: 'Dobles',
                });

                aCols.push({
                    label: 'Dobles por partido',
                    property: 'DPG',
                });

                aCols.push({
                    label: 'Triples',
                    property: 'Triples',
                });

                aCols.push({
                    label: 'Triples por partido',
                    property: 'TPG',
                });

                aCols.push({
                    label: 'Asistencias',
                    property: 'Asistencias',
                });

                aCols.push({
                    label: 'Asistencias por partido',
                    property: 'APG',
                });

                aCols.push({
                    label: 'Rebotes',
                    property: 'Rebotes',
                });

                aCols.push({
                    label: 'Rebotes por partido',
                    property: 'RPG',
                });

                aCols.push({
                    label: 'Minutos',
                    property: 'Minutos',
                });

                aCols.push({
                    label: 'Minutos por partido',
                    property: 'MPG',
                });

                return aCols;
            },

            onExport: function() {
                let aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('idTablaListaJugadores');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'ListaJugadores.xlsx'
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },

             /* ---------------------------------------------------------------------------------------------------------*/

            // FILTROS
            // FILTRO EQUIPO - VALUE HELP
            onOpenTeamValueHelp: function(){
                if(!this._oValueHelpEquipo){
                    Fragment.load({
                        name: "academia2022.znba.view.fragments.ValueHelpEquipos",
                        controller: this,
                        id: this.getView().getId()
                    }).then(function (oPopup) {
                        this._oValueHelpEquipo = oPopup;
                        this.getView().addDependent(oPopup);
                        this._oValueHelpEquipo.open();
                    }.bind(this));
                } else {
                    this._oValueHelpEquipo.open();
                }
            },
            onCloseValueHelp: function(oEvent){
                let aContexts = oEvent.getParameter("selectedContexts");
                let aFilterEquipo = [];
                let aEquipos = []

                if (aContexts && aContexts.length) {
                    aContexts.map(function (oContext) {
                        let equipo = oContext.getObject().NombreEquipo
                        aFilterEquipo.push(new sap.ui.model.Filter("NombreEquipo", sap.ui.model.FilterOperator.Contains, equipo));
                        aEquipos.push(equipo)                         
                    })
                }
                //let oTabla = this.getView().byId("idTablaListaJugadores");
                //oTabla.getBinding("items").filter(aFilterEquipo);

                
                this.getView().byId("inputEquipo").setValue(aEquipos.join(", "))
                this.onFilterChange()
            },

            // FILTRO POSICION
            onFilterChange: function(){
                let inputEquipos = this.getView().byId("inputEquipo").getValue()
                let aEquipos = inputEquipos.split(", ")
                let aPosiciones = this.getView().byId("idMultiPosiciones").getSelectedKeys();
                let aFilters = [];

                if(aEquipos.length>0){
                    let aFilterEquipo = [];
                    for(var i = 0; i<aEquipos.length; i++){
                        aFilterEquipo.push(new sap.ui.model.Filter("NombreEquipo", sap.ui.model.FilterOperator.Contains, aEquipos[i]));
                    }
                    if(aFilterEquipo.length > 0){
                        aFilters.push(new Filter({
                            filters: aFilterEquipo,
                            and: false
                        }));
                    }
                }

                if(aPosiciones.length > 0){
                    var aFilterPosiciones = [];
                    for(var i = 0; i<aPosiciones.length; i++){
                        aFilterPosiciones.push(new Filter("Posicion", sap.ui.model.FilterOperator.EQ, aPosiciones[i]));
                    }
                    if(aFilterPosiciones.length > 0){
                        aFilters.push(new Filter({
                            filters: aFilterPosiciones,
                            and: false
                        }));
                    }
                }

                let oJugadores = this.getView().byId("idTablaListaJugadores").getBinding("items")
                oJugadores.filter(aFilters)
            },
        });
    });