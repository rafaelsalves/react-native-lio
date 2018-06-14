## React Native Android Library Lio

1. Pull from **GitHub**.
2. Do `yarn add https://github.com/rafaelalvesengcomp/react-native-lio.git` in your main project.
3. Link the library:
    * Add the following to `android/settings.gradle`:
        ```
        include ':react-native-lio'
        project(':react-native-lio').projectDir = new File(settingsDir, '../node_modules/react-native-lio/android')
        ```

    * Add the following to `android/app/build.gradle`:
        ```xml
        ...

        dependencies {
            ...
            compile project(':react-native-lio')
        }
        ```
    * Add the following to `android/app/src/main/java/**/MainApplication.java`:
        ```java

        import com.fortalsistemas.lio.Package;

        public class MainApplication extends Application implements ReactApplication {

            @Override
            protected List<ReactPackage> getPackages() {
                return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new Package()     // add this for react-native-android-library-boilerplate
                );
            }
        }
        ```
4. Change line 85 on file Module, put number of line in table of application.