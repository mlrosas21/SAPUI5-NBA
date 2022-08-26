sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, Fragment, MessageBox, JSONModel, UIComponent) {
        "use strict";

        return Controller.extend("academia2022.znba.controller.Equipos", {
            onInit: function () {
                const oViewModel = new JSONModel({
                    editarEquipo: false
                })
                this.getView().setModel(oViewModel, "vista")
                
                const oEquipoModel = new JSONModel()
                this.getView().setModel(oEquipoModel, "equipo")

                const oEquiposModel = new JSONModel({});
                this.getView().byId("idEquiposGrid").setModel(oEquiposModel, "equiposJson");
            },
            onTeamPress: function(oEvent) {
                // let equipo = oEvent.getSource().getBindingContext("equiposJson").getObject();
                let equipo = oEvent.getSource().getBindingContext().getObject();
                let oRouter = UIComponent.getRouterFor(this)

                oRouter.navTo("RouteEquipoDetalle", {
                    NombreEquipo: equipo.NombreEquipo
                })
            },
            onPlayersListPress: function(oEvent){
                let oRouter = UIComponent.getRouterFor(this)

                oRouter.navTo("RouteListaJugadores")
            },
            /*
            onAfterRendering:function(){
                this.loadTeams()
            },
            // GET SET
            loadTeams: function(){
                let oModel = this.getView().getModel()

                oModel.read("/EquipoSet", {
                    success: function(oDatos){
                        this.getView().byId("idEquiposGrid").getModel("equiposJson").setData(oDatos.results);
                    }.bind(this),
                    error: function(){
                        this.getView().byId("idEquiposGrid").getModel("equiposJson").setData([]);
                    }.bind(this)
                })
            },
            */
            addTeam: function() {
                let oModel = this.getView().getModel();
                let oEquipo = this.getView().getModel("equipo").getData();
                oEquipo.NombreEquipo = oEquipo.NombreEquipo.toUpperCase()

                oModel.create("/EquipoSet", oEquipo, {
                    success: () => {
                        MessageToast.show("Equipo "+oEquipo.NombreEquipo+" añadido exitosamente.")
                    },
                    error: (oError) => {
                        MessageToast.show("Error al conectar con el servidor.")
                    }
                })
                this._oDialogEquipo.close();
            },
            editTeam: function(){
                let oModel = this.getView().getModel()
                let oEquipo = this.getView().getModel("equipo").getData()

                let path = oModel.createKey("/EquipoSet",{
                    NombreEquipo: oEquipo.NombreEquipo
                })

                oModel.update(path, oEquipo, {
                    success: () => {
                        MessageToast.show("Equipo modificado exitosamente.")
                    },
                    error: (oError) => {
                        MessageToast.show("Error al conectar con el servidor.")
                    }
                })

                this._oDialogEquipo.close();
            },
            // Pop up - agregar equipo nuevo
            _onOpenAddTeam: function() {
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
            onOpenAddTeam: function() {
                console.log("PRESS")
                this.getView().getModel("vista").setProperty("/editarEquipo", false);
                let oDataEquipo = {
                    NombreEquipo: "",
                    Ciudad: "",
                    Estado: "",
                    Entrenador: ""
                }
                this.getView().getModel("equipo").setData(oDataEquipo)
                this._onOpenAddTeam();
            },
            onCancelar: function(){
                this._oDialogEquipo.close();
            },

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
