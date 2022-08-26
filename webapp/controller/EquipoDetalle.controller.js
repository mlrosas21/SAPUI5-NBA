sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "academia2022/znba/model/formatter",
    'sap/ui/Device', 
    'sap/ui/model/Filter',
    'sap/ui/model/Sorter',
    'sap/ui/export/Spreadsheet',
], function (JSONModel, Controller, UIComponent, Fragment, MessageToast, MessageBox, formatter, Device, Filter, Sorter, Spreadsheet) {
	"use strict";

	return Controller.extend("academia2022.znba.controller.EquipoDetalle", {
        formatter: formatter,

		onInit: function () {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteEquipoDetalle").attachPatternMatched(this._onRouteMatched, this);

            const oJugadorModel = new JSONModel()
            this.getView().setModel(oJugadorModel, "jugador")

            const oEquipoModel = new JSONModel()
            this.getView().setModel(oEquipoModel, "equipo")

            let oViewModel = new JSONModel({
                editarEquipo: true,
                editarJugador: false
            });
            this.getView().setModel(oViewModel, "vista");

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
			this._mViewSettingsDialogs = {};
		},
        _onRouteMatched: function (oEvent) {
            let NombreEquipo = oEvent.getParameter("arguments").NombreEquipo;
            this._NombreEquipo = NombreEquipo;

            this.getView().getModel().metadataLoaded().then(
                function () {
                    let path = this.getView().getModel().createKey("/EquipoSet", {
                        NombreEquipo: NombreEquipo
                    });

                    this.getView().bindElement({ path: path });
                }.bind(this)
            );
        },

        /* ---------------------------------------------------------------------------------------------------------*/

        //BORRAR EQUIPO
        deleteTeam: function(oEvent){
            
            let oModel = this.getView().getModel();
            let path = oEvent.getSource().getBindingContext().getPath();
            let oRouter = UIComponent.getRouterFor(this)

            MessageBox.warning("El equipo será borrado junto a todos los jugadores asociados y no se podrán recuperar. ¿Desea continuar?", {
                
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if(sAction === 'OK'){
                        oModel.remove(path, {
                            success: function (){
                                let sMsg = "Se eliminó el equipo y sus jugadores";
                                MessageToast.show(sMsg);
                                window.history.go(-1)
                            }.bind(this),
                            error: function (oError){
                                MessageToast.show("Error al conectar con el servidor");
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        /* ---------------------------------------------------------------------------------------------------------*/

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

        // ORDENAMIENTO
        handleSortButtonPressed: function () {
			this.getViewSettingsDialog("SortDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},

        handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("idTablaJugadores"),
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

        // FILTRO
        onFilterChange: function(){
            let aPosiciones = this.getView().byId("idMultiPosiciones").getSelectedKeys();

            var aFilters = [];

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

            let oJugadores = this.getView().byId("idTablaJugadores").getBinding("items")
            oJugadores.filter(aFilters)

        },

        // Detalle jugador al clickear
        onPlayerPress: function(oEvent){
            let jugador = oEvent.getSource().getBindingContext().getObject();
            let oRouter = UIComponent.getRouterFor(this)

            oRouter.navTo("RouteJugador", {
                NombreEquipo: jugador.NombreEquipo, 
                Dorsal: jugador.Dorsal
            })
        },

        /* ---------------------------------------------------------------------------------------------------------*/

        // AGREGAR JUGADOR NUEVO
        // Agregar jugador
        addPlayer: function(oEvent){
            let oModel = this.getView().getModel();
            let oJugador = this.getView().getModel("jugador").getData();

            let oForm = this.getView().byId('idFormJugador')
            let aInput = oForm.getFormContainers()[0].getFormElements()


            oModel.create("/JugadorSet", oJugador, {
                success: () => {
                    MessageToast.show("Jugador añadido exitosamente.")
                    this._oDialogJugador.close();
                },
                error: (oError) => {
                    MessageToast.show("Error al conectar con el servidor.")
                }
            })
        },

        // Pop up - agregar jugador
        onOpenAddPlayer: function(oEvent) {
            let oDataJugador = {
                NombreEquipo: "",
                Dorsal: 0,
                Posicion: "",
                Nombre: "",
                Apellido: "",
                Altura: "",
                Peso: "",
                Nacionalidad:""
            }
            let equipo = oEvent.getSource().getBindingContext().getObject().NombreEquipo
            oDataJugador.NombreEquipo = equipo
            this.getView().getModel("jugador").setData(oDataJugador)
            this._onOpenAddPlayer();
        },
        _onOpenAddPlayer: function() {
            Fragment.load({
                name: "academia2022.znba.view.fragments.PopUpJugador",
                controller: this,
                id: this.getView().getId()
            }).then(function(oPopUp) {
                this._oDialogJugador = oPopUp;
                this.getView().addDependent(oPopUp);
                this._oDialogJugador.attachAfterClose(function (oEvent){
                    oEvent.getSource().destroy()
                })
                this._oDialogJugador.open()
            }.bind(this))
        },

        /*
        // AGREGAR JUGADORES (+ DE 1)
        onAddJugadores: function () {
            Fragment.load({
                name: "academia2022.znba.view.fragments.PopUpJugadores",
                controller: this
            }).then(function (oPopup) {

                //se asigna un control en una variable para poder capturarlo luego
                this._oDialogAddJugadores = oPopup;
                this.getView().addDependent(oPopup);

                //destruirlo cuando lo cierro
                this._oDialogAddJugadores.attachAfterClose(function (oEvent) {
                    oEvent.getSource().destroy();
                });

                //Modelo inicial cuando abre el popup
                this._oDialogAddJugadores.attachAfterOpen(function () {
                    var oModeloJugadores = new JSONModel([
                        {
                            Dorsal: "",
                            Nombre: "",
                            Apellido: "",
                            FechaDeNacimiento: "",
                            Posicion: ""
                        }
                    ]);
                    this._oDialogAddJugadores.setModel(oModeloJugadores, "AgregarJugadores");
                }.bind(this));
                this._oDialogAddJugadores.open();
            }.bind(this));
        },

        onAddLineaJugadores: function () {
            var aJugadores = this._oDialogAddJugadores.getModel("AgregarJugadores").getData();
            aJugadores.push({
                Dorsal: "",
                Nombre: "",
                Apellido: "",
                FechaDeNacimiento: "",
                Posicion: ""
            });
            this._oDialogAddJugadores.getModel("AgregarJugadores").setData(aJugadores);

        },

        onSaveJugadores: function () {
            var aJugadores = this._oDialogAddJugadores.getModel("AgregarJugadores").getData();
            var oData = {
                NombreEquipo: this._NombreEquipo,
            };
            oData.To_Jugadores = aJugadores;

            this.getView().getModel().create("/EquipoSet", oData, {
                success: function (oData) {
                    sap.m.MessageToast.show("Se han agregado jugadores a "+oData.NombreEquipo);
                    this.onCloseDialogJugadores();
                }.bind(this),
                error: function () {
                    sap.m.MessageToast.show("Error");
                }.bind(this),
            })

        },

        onCloseDialogJugadores: function () {
            this._oDialogAddJugadores.close();
        },
        */

        /* ---------------------------------------------------------------------------------------------------------*/

        // EDITAR EQUIPO
        // Editar equipo
        editTeam: function(){
            let oModel = this.getView().getModel();
            let oEquipo = this.getView().getModel("equipo").getData();

            let path = oModel.createKey("/EquipoSet", {
                NombreEquipo: oEquipo.NombreEquipo
            });
            
            oModel.update(path, oEquipo, {
                success: function (){
                    let sMsg = "Se modificó el equipo " + oEquipo.NombreEquipo;
                    MessageToast.show(sMsg);
                },
                error: function (oError){
                    MessageToast.show("Error al conectar con SAP: "+oError);
                }
            });
            this._oDialogEquipo.close();
        },
        _onOpenEditTeam: function() {
            Fragment.load({
                name: "academia2022.znba.view.fragments.PopUpEquipo",
                controller: this,
                id: this.getView().getId()
            }).then(function(oPopUp) {
                this._oDialogEquipo = oPopUp;
                this.getView().addDependent(oPopUp);
                this._oDialogEquipo.attachAfterClose(function (oEvent){
                    oEvent.getSource().destroy()
                })
                this._oDialogEquipo.open()
            }.bind(this))
        },
        
        // Pop up - agregar equipo nuevo
        onOpenEditTeam: function(oEvent) {
            //agarro los datos de la linea que estan en el modelo odata
            let equipo = oEvent.getSource().getBindingContext().getObject();

            //agarro la linea del modelo locla JSON
            this.getView().getModel("equipo").setData(equipo);
            this._onOpenEditTeam();
        },
        onCancelar: function(){
            this._oDialogEquipo.close();
        },
        onCancelarJug: function(){
            this._oDialogJugador.close();
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
				this._oTable = this.byId('idTablaJugadores');
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
				fileName: 'Plantilla.xlsx'
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		},

        /* ---------------------------------------------------------------------------------------------------------*/
        // Validar texto sin numeros
        validateInputText: function(oEvent){
            let RegEx = /^([a-zñáéíóú ]+)$/i;
            let input = oEvent.getSource()
            let valor = input.getValue()

            if(RegEx.test(valor)){
                input.setValueState(sap.ui.core.ValueState.Success); 
            } else {
                input.setValueState(sap.ui.core.ValueState.Error);
            }

        },

        // Validar números
        validateInputNumeros: function(oEvent){
            let RegEx = /^\d+$/;
            let input = oEvent.getSource()
            let valor = input.getValue()

            if(RegEx.test(valor)){
                input.setValueState(sap.ui.core.ValueState.Success); 
            } else {
                input.setValueState(sap.ui.core.ValueState.Error);
            }
        },

        // Validar fecha
        handleDateChange: function(oEvent){
            let oDP = oEvent.getSource(),
            bValid = oEvent.getParameter("valid");

            if (bValid) {
                oDP.setValueState(sap.ui.core.ValueState.Success);
            } else {
                oDP.setValueState(sap.ui.core.ValueState.Error);
            }
        },

        // Validar combo box
        onComboChange: function(oEvent){
            let comboBox = oEvent.getSource()
            let selectedKey = comboBox.getSelectedKey()
            if(!selectedKey){
                comboBox.setValueState(sap.ui.core.ValueState.Error)
            }
        }

	});
});