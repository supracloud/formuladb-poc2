/**
 * TODOs:
 * 1. Take into account the time spent in loading page elements and remove it from the browser sleep duration. Could impact timing. 
 * 2. FInd out why do I need that sleep before merging the audio/video files
 * 3. Configure a docker image with preinstalled software stack:
 *   sudo yum install -y java-1.8.0-openjdk-devel git
 *   sudo yum install libX11-devel libpng-devel libXtst-devel
 *   sudo vi /etc/yum.repos.d/google-chrome.repo -> https://www.tecmint.com/install-google-chrome-on-redhat-centos-fedora-linux/
 *   sudo yum install -y google-chrome-stable
 *   sudo yum install -y chromedriver chromium xorg-x11-server-Xvfb
 *   sudo yum install -y gcc-c++.x86_64
 *   sudo npm install -g @angular/cli
 *   sudo npm install -g protractor
 *   sudo npm install -g selenium standalone
 *   webdriver-manager update
 * HOW TO RUN IT on Windows in Chrome: (Note! not for final video, only for development. The browser is not maximized and cropping is not tweaked)
 *   export GOOGLE_APPLICATION_CREDENTIALS=soica-d09d94fbea9e.json
 *   npm install
 *   ./node_modules/@angular/cli/bin/ng e2e
 * HOW TO RUN IT in VM:
 *   export GOOGLE_APPLICATION_CREDENTIALS=soica-d09d94fbea9e.json
 *   export DISPLAY=:99
 *   Xvfb -ac :99 -screen 0 1920x1080x16 &
 *   webdriver-manager start /dev/null 2>&1
 *   ng e2e
 * 
 * HOW TO RUN IT IN CONTAINER:
 * 
 * docker login --username <docker hub username> --password <password> 
 * 
 * docker run --name ci-with-video --cap-add=SYS_ADMIN --user centos -it registry.gitlab.com/metawiz/febe/ci-with-video:1.0.0 bash -c \
 * 'source ~/.bashrc && cd && git clone https://lsoica:greudespart2@gitlab.com/metawiz/febe.git && cd febe/ && cd storage && npm install && \
 * cd .. && cd core && npm install && cd .. && cd fe/ && npm install && ng e2e'
 * 
 * And get the final video from it:
 * 
 * docker cp ci-with-video:/home/centos/febe/fe/e2e/reports/videos/protractor-cropped.avi .
 */
