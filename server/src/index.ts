import { startServer } from "./Config/server";
import dotenv from "dotenv";

dotenv.config({path:"./.env"});

startServer()