import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModule: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ){}

  /*async exceuteSeed() {
    await this.pokemonModule.deleteMany({});
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');
    const insertPromiseArray: Promise<Pokemon> [] = [];
    data.results.forEach(async({name, url})=>{
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      //const pokemon = await this.pokemonModule.create({name, no});
      insertPromiseArray.push(
        this.pokemonModule.create({name, no})
      );
    });

    await Promise.all(insertPromiseArray);
    return "Seed Execute";
  }*/ //Prima forma con el arreglo y promesa 

  async exceuteSeed() {
    await this.pokemonModule.deleteMany({});
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    const pokemonToInsert: {name: string, no: number} [] = [];
    data.results.forEach(async({name, url})=>{
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      //const pokemon = await this.pokemonModule.create({name, no});
      pokemonToInsert.push({name, no});
    });
    this.pokemonModule.insertMany(pokemonToInsert);
    //Insert into pokemon (name,no)
    // (name: bolbasur, no: 1)
    // (name: bolbasur, no: 1)
    // (name: bolbasur, no: 1)
    // (name: bolbasur, no: 1)
    // asi hasta los 650 que se pide en el link
    return "Seed Execute";
  }

}
