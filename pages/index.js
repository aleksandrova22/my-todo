import { ToDo } from "@/components/todo";
import Head from "next/head";


export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
      </Head>
      <h1>Список дел</h1>
 
      <ToDo />
    
    </>
  );
}


