import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/app/models/user.entity";
import { UserService } from "../../users/service/user.service";
import { initDatabase } from "@/lib/init-database";
const JWT_SECRET = process.env.JWT_SECRET!;

export enum TipoUsuario {
    Colaborador = 'Colaborador',
    Administrador = 'Administrador',
}

const userService = new UserService();

export async function POST(req:Request){
    const { ci, password} = await req.json();
    //Verificar db
    await initDatabase();
    const user = await userService.findOne(ci);
    if(user == undefined){
        return NextResponse.json({error:"Credenciales invalidas"}, {status:401});
    }else if(user.password != password){
        return NextResponse.json({error:"Mala contrasenia"}, {status:401});
    }
    const nombreUsuario = user.nombre;
    const tipoUsuario = TipoUsuario.Colaborador;
    const accessToken = jwt.sign({nombre: nombreUsuario, tipo: tipoUsuario}, JWT_SECRET, {expiresIn:"15m"})
    
    const refreshToken = jwt.sign({nombre: nombreUsuario, tipo: tipoUsuario}, JWT_SECRET, {expiresIn:"180d"})

    const res = NextResponse.json({accessToken});
    res.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
        maxAge: 60*60*24*180,
    });
    return res;
}