CREATE DATABASE desi26_2


CREATE TABLE `desi26_2`.`usuario` (
  `idusuario` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NULL,
  `email` VARCHAR(150) NULL,
  `senha` VARCHAR(80) NULL,
  `cpf` VARCHAR(11) NULL,
  `logradouro` VARCHAR(150) NULL,
  `bairro` VARCHAR(100) NULL,
  `estado` VARCHAR(2) NULL,
  `numero` VARCHAR(45) NULL,
  `cidade` VARCHAR(100) NULL,
  PRIMARY KEY (`idusuario`));