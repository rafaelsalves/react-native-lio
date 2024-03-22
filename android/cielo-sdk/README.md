# Como utilizar o SDK da LIO no seu Android App.

Estamos disponibilizando junto com este README dois diretórios: **com** e **cielo**, basta copiá-los para o seu repositório `.m2/repository`, exemplos:
No Windows: `C:\Users\<usuario>\.m2`
No Linux: `/home/<usuario>/.m2`
No Mac: `/Users/<usuario>/.m2`

## Gradle
No **build.gradle** na raiz do seu projeto, adicionar o mavenLocal() dentro da closure **allprojects** conforme abaixo:
```
allprojects {  
  repositories {  
    mavenLocal()  
	... 
  }  
}
```
No **build.gradle** do app, adicionar a dependência dentro da closure **dependencies** conforme abaixo:

```
dependencies {    
  implementation 'com.cielo.lio:order-manager:1.8.2'  
}
```

Realizar o build do projeto.