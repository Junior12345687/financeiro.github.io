const {DataTypes, DATE, where} = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    perfil: {
        type:DataTypes.ENUM('admin', 'financeiro', 'gestor', 'visualizador'),
        allowNull:false,
        defaultValue: 'visualizador'
    },
    avatar_iniciais: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
            is: {
                args: /^[A-Za-zÀ-ÿ]{2}$/,
            }
        }
    },
    // ativo: {
    //     type:DataTypes.BOOLEAN,
    //     allowNull: false,
    //     defaultValue: true
    // }

}, {
    timestamps: false,
    tableName: 'users',
});

const Empresas = sequelize.define('Empresas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type:DataTypes.STRING,
        allowNull: false
    },
    cnpj: {
        type: DataTypes.STRING,

    },

},{
    timestamps: false,
    tableName: 'empresa',
});

const Categorias = sequelize.define('Categorias',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.ENUM('entrada', 'saida', 'ambos'),
        cor_hex: {
            type: DataTypes.STRING(7),
            allowNull: false,
            default: '#38bdf8',
            validate: {
                is: {
                    args: /^#[0-9A-Fa-f]{6}$/,
                }
            }
        }
    }

},{
    timestamps:false,
    tableName:'categoria'
});
module.exports = User, Empresas, Categorias;