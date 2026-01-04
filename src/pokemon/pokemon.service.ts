import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModule: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModule.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
    
  }

  findAll( paginationDto : PaginationDto) {
    //return this.pokemonModule.find(); //Imprime todo los poquemon

    const { limit = 10, offset = 0} = paginationDto;
    return this.pokemonModule
    .find()
    .limit(limit)
    .skip(offset)
    .sort({
      no: 1
    })
    .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null= null;

    if( !isNaN(+term)){
      pokemon = await this.pokemonModule.findOne({no: +term});
    }
    //MongoID
    if( !pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModule.findById( term );
    }
    //Name
    if( !pokemon ){
      pokemon = await this.pokemonModule.findOne({name: term.toLowerCase().trim()});
    }

    if ( !pokemon ){
      throw new NotFoundException (`Pokemon with id, name or no ${term} no found`);
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto,{new:true});
      return {...pokemon.toJSON(),...updatePokemonDto};      
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    //const pokemon = await this.findOne( id );
    //await pokemon.deleteOne();
    //const result = await this.pokemonModule.findByIdAndDelete(id);
    const {deletedCount} = await this.pokemonModule.deleteOne({_id:id});
    if(deletedCount===0){
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }
    return;
  }

  private handleException (error : any){
    if(error.code === 11000){
        throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify(error.keyValue) }`);
      }
      console.log(error);
      throw new InternalServerErrorException(`Can't create Pokemon - Check server log`);
  }
}
