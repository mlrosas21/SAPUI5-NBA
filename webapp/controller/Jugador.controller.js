sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "academia2022/znba/model/formatter", 
], function (JSONModel, Controller, UIComponent, Fragment, MessageToast, MessageBox, formatter) {
	"use strict";

	return Controller.extend("academia2022.znba.controller.Jugador", {
        formatter: formatter,
		onInit: function () {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteJugador").attachPatternMatched(this._onRouteMatched, this);

            let oViewModel = new JSONModel({
                editarJugador: true
            });
            this.getView().setModel(oViewModel, "vista");

            const oJugadorModel = new JSONModel()
            this.getView().setModel(oJugadorModel, "jugador")

            const oRawJugadorModel = new JSONModel()
            this.getView().setModel(oRawJugadorModel, "rawJugador")

            const oUpdatingPointsModel = new JSONModel()
            this.getView().setModel(oUpdatingPointsModel, "updatingPoints")

            const oUpdateStatsModel = new JSONModel()
            this.getView().setModel(oUpdateStatsModel, "updatingStatsJugador")

            const oEquipoModel = new JSONModel()
            this.getView().setModel(oEquipoModel, "equipo")

            this._formFragments = {};

			// Set the initial form to be the display one
			this._showFormFragment("DisplayFragment");
		},
        _onRouteMatched: function (oEvent) {
            let NombreEquipo = oEvent.getParameter("arguments").NombreEquipo;
            this._NombreEquipo = NombreEquipo;
            let Dorsal = oEvent.getParameter("arguments").Dorsal;
            this._Dorsal = Dorsal;

            this.getView().getModel().metadataLoaded().then(
                function () {
                    const path = this.getView().getModel().createKey("/JugadorSet", {
                        NombreEquipo: NombreEquipo,
                        Dorsal: Dorsal
                    });
                    this.getView().bindElement({ path: path });

                }.bind(this)
            );
        },

        /* ---------------------------------------------------------------------------------------------------------*/

        // EDITAR JUGADOR
        editPlayer: function(){
            let oModel = this.getView().getModel();
            let oJugador = this.getView().getModel("jugador").getData();

            let path = oModel.createKey("/JugadorSet", {
                NombreEquipo: oJugador.NombreEquipo,
                Dorsal: oJugador.Dorsal
            });
            
            oModel.update(path, oJugador, {
                success: function (){
                    let sMsg = "Se modificó el jugador " + oJugador.Apellido;
                    MessageToast.show(sMsg);
                },
                error: function (oError){
                    MessageToast.show("Error al conectar con SAP: "+oError);
                }
            });
            
            this._oDialogJugador.close();
        },
        _onOpenEditPlayer: function() {
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
        // Pop up - agregar jugador nuevo
        onOpenEditPlayer: function(oEvent) {
            let jugador = oEvent.getSource().getBindingContext().getObject();
            this.getView().getModel("jugador").setData(jugador);
            this._onOpenEditPlayer();
        },
        onCancelarJug: function(){
            this._oDialogJugador.close();
        },

        /* ---------------------------------------------------------------------------------------------------------*/

        // BORRAR JUGADOR
        deletePlayer: function(oEvent){
            
            let oModel = this.getView().getModel();
            let path = oEvent.getSource().getBindingContext().getPath();
            let oRouter = UIComponent.getRouterFor(this)

            MessageBox.warning("El jugador será borrado y no se podrá recuperar. ¿Desea continuar?", {
                
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if(sAction === 'OK'){
                        oModel.remove(path, {
                            success: function (){
                                let sMsg = "Se elimino el jugador";
                                MessageToast.show(sMsg);
                                window.history.go(-1) 
                                //oRouter.navTo("RouteEquipos")
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

        // AGREGAR REGISTRO PARTIDO - usando Function Import
        onOpenaddMatchStats: function(oEvent) {
            let oDataRawJugador = {
                Minutos:oEvent.getSource().getBindingContext().getObject().Minutos,
                Dobles: oEvent.getSource().getBindingContext().getObject().Dobles,
                Triples: oEvent.getSource().getBindingContext().getObject().Triples,
                TirosLibres: oEvent.getSource().getBindingContext().getObject().TirosLibres,
                Asistencias: oEvent.getSource().getBindingContext().getObject().Asistencias,
                Rebotes: oEvent.getSource().getBindingContext().getObject().Rebotes, 
                Puntos: oEvent.getSource().getBindingContext().getObject().Puntos
            }

            let oDataJugador = {
                NombreEquipo: oEvent.getSource().getBindingContext().getObject().NombreEquipo,
                Dorsal: oEvent.getSource().getBindingContext().getObject().Dorsal,
                PartidosJugados: oEvent.getSource().getBindingContext().getObject().PartidosJugados + 1,
                Minutos: 0,
                Dobles:0,
                Triples:0,
                TirosLibres:0,
                Asistencias:0,
                Rebotes:0,
            }

            this.getView().getModel("rawJugador").setData(oDataRawJugador)
            this.getView().getModel("jugador").setData(oDataJugador)
            this._onOpenAddMatchStats();
        },
        _onOpenAddMatchStats: function() {
            Fragment.load({
                name: "academia2022.znba.view.fragments.PopUpPartido",
                controller: this,
                id: this.getView().getId()
            }).then(function(oPopUp) {
                this._oDialogPartido = oPopUp;
                this.getView().addDependent(oPopUp);
                this._oDialogPartido.attachAfterClose(function (oEvent){
                    oEvent.getSource().destroy()
                })
                this._oDialogPartido.open()
            }.bind(this))
        },
        addMatchStats:function(){
            let oRawJugador = this.getView().getModel("rawJugador").getData();
            let oJugador = this.getView().getModel("jugador").getData();
            oJugador.Puntos = oJugador.TirosLibres + (oJugador.Dobles*2) + (oJugador.Triples*3)

            oJugador.Puntos += oRawJugador.Puntos
            oJugador.Minutos += oRawJugador.Minutos
            oJugador.Dobles += oRawJugador.Dobles
            oJugador.Triples += oRawJugador.Triples
            oJugador.Asistencias += oRawJugador.Asistencias
            oJugador.Rebotes += oRawJugador.Rebotes

            MessageBox.confirm("¿Desea confirmar el registro?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirmación",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (sAction) {
                    if(sAction === 'YES'){
                        this._addMatchStats()
                    }
                }.bind(this)
            });
        },
        _addMatchStats: function(oEvent){
            let oModel = this.getView().getModel();
            let oJugador = this.getView().getModel("jugador").getData();

            let path = oModel.createKey("/JugadorSet", {
                NombreEquipo: oJugador.NombreEquipo,
                Dorsal: oJugador.Dorsal
            });

            let sJugador = JSON.stringify(oJugador)

            this.getView().getModel().callFunction("/AgregarDatosPartido",{
                method: "GET",
                urlParameters: {
                    "Jugador": sJugador
                },
                success: function (oData){
                    MessageToast.show(oData.Mensajes);
                    this.getView().getModel().refresh()
                }.bind(this),
                error: function (oError){
                    MessageToast.show("Error al conectar con SAP: "+oError);
                }

            })            
            this._oDialogPartido.close();
        },

        // Cerrar Pop Up
        onCancelarPartido: function(){
            this._oDialogPartido.close();
        },

        /* ---------------------------------------------------------------------------------------------------------*/

        // Display form <-> Change form
        _getFormFragment: function (sFragmentName) {
			let pFormFragment = this._formFragments[sFragmentName],
				oView = this.getView();
			if (!pFormFragment) {
				pFormFragment = Fragment.load({
					id: oView.getId(),
					name: "academia2022.znba.view.fragments." + sFragmentName, 
                    controller: this
				});
				this._formFragments[sFragmentName] = pFormFragment;
			}
			return pFormFragment;
		},
		_showFormFragment : function (sFragmentName) {
			let oSubSection = this.byId("statsTotales");
			oSubSection.removeAllBlocks()
			this._getFormFragment(sFragmentName).then(function(oVBox){
				oSubSection.insertBlock(oVBox);
			});
		},

        _toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "ChangeFragment" : "DisplayFragment");
		},

        /* ---------------------------------------------------------------------------------------------------------*/

        // BOTONES EDITAR TOTALES FORM
        handleEditPress : function (oEvent) {          
			this._toggleButtonsAndView(true);
            let puntos = oEvent.getSource().getBindingContext().getObject().Puntos
            this.getView().getModel("updatingPoints").setData(puntos)

		},
        handleCancelPress : function () {
			this._toggleButtonsAndView(false);
		},
        handleSavePress : function (oEvent) {
            let nombreEquipo = oEvent.getSource().getBindingContext().getObject().NombreEquipo
            let dorsal = oEvent.getSource().getBindingContext().getObject().Dorsal

            let oDataJugador = {
                NombreEquipo: nombreEquipo,
                Dorsal: dorsal,
                PartidosJugados: this.byId('partidosJugadosForm').getValue(),
                Minutos: this.byId('minutosForm').getValue(),
                Dobles: this.byId('doblesForm').getValue(),
                Triples: this.byId('triplesForm').getValue(),
                TirosLibres: this.byId('tirosLibresForm').getValue(),
                Asistencias: this.byId('asistenciasForm').getValue(),
                Rebotes: this.byId('rebotesForm').getValue(), 
                Puntos: this.byId('puntosForm').getValue()
            }
            this.getView().getModel("updatingStatsJugador").setData(oDataJugador)
            this.updateTotals();
		},
        onChange: function(oEvent){
            MessageToast.show("Value changed to '" + oEvent.getParameter("value") + "'");
            let puntos = this.getView().getModel("updatingPoints").getData();
            puntos = this.byId('tirosLibresForm').getValue() + (this.byId('doblesForm').getValue() * 2) + (this.byId('triplesForm').getValue() * 3)
            this.getView().getModel("updatingPoints").setData(puntos)
        },
        updateTotals: function(){
            let oModel = this.getView().getModel();
            let oJugador = this.getView().getModel("updatingStatsJugador").getData();

            let path = oModel.createKey("/JugadorSet", {
                NombreEquipo: oJugador.NombreEquipo,
                Dorsal: oJugador.Dorsal
            });
            
            oModel.update(path, oJugador, {
                success: function (){
                    let sMsg = "Se modificaron los totales del jugador";
                    MessageToast.show(sMsg);
                },
                error: function (oError){
                    MessageToast.show("Error al conectar con SAP: "+oError);
                }
            });

            this._toggleButtonsAndView(false);
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