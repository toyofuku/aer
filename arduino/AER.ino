#include <Ethernet.h>
#include <SPI.h>

#define ledPin  2
#define ledOn   8
#define ledOff  7

// TODO: replace addresses
byte mac[] = {0x90,0xA2,0xDA,0x00,0x37,0x6B}; 
byte ip[] = {192,168,100,9};  // The Arduino device IP
byte subnet[] = {255,255,255,0};
byte gateway[] = {192,168,100,1};
byte server[] = {192,168,100,12}; // HTTP server IP

/** 
 * 暖房21℃オンのビットパターン
 *
// customer code
1,1,1,1, 0,0,1,0,
0,0,0,0, 1,1,0,1,
// parity
0,0,0,0,
// data 0
0,0,1,1,
// data 1
1,1,1,1, 1,1,0,0,
0,0,0,0, 0,0,0,
//温度
1,0,1,0,0,
// SWING
0,0,0,
// 風量
0,1,1,
0,0,0,
// H_ON:011 OFF:111 
0,1,1,
0,0,0,0, 0,0,0,0,
1,0,0,0, 0,
// H_ON:010 OFF:110
0,1,0
*/

int data_choice = 0;

unsigned int data_off[] = {
438,438,
54,160,55,160,55,162,54,161,55,55,52,56,52,161,54,55,
52,56,52,55,52,55,52,56,51,161,55,161,54,56,52,161,
54,53,54,56,51,53,54,55, //parity
52,56,54,53,51,161,55,161, // data 0
54,161,54,161,54,161,54,161,55,160,55,160,55,55,52,56, // data 1
52,53,54,53,54,55,52,53,54,55,52,55,52,55,
52,161,55,53,54,161,54,55,52,53, //温度
54,56,52,55,52,56, // SWING
51,56,52,161,54,160, // 風量
55,55,52,53,54,54,
53,161,57,159,54,161, // OFF:111
54,55,52,56,52,54,53,56,52,56,51,53,54,55,52,55,
52,161,54,55,52,56,52,54,54,55,
52,161,55,162,54,56, // OFF:110
52,525,438,438,
55,160,54,161,54,161,54,161,54,53,54,56,51,161,54,53,
54,56,52,53,54,55,54,53,52,161,54,161,57,53,52,161,
55,55,52,56,52,55,55,50,
54,56,52,53,54,161,54,160,
54,161,54,161,54,161,54,161,54,161,54,161,54,55,54,50,
54,55,52,56,51,53,54,56,52,56,52,53,54,53,
54,161,54,53,56,159,54,55,52,56,
52,53,54,55,52,53,
56,51,54,161,54,160,
55,55,52,56,51,56,
54,159,54,161,54,161, // OFF:111
54,55,52,56,52,55,52,53,54,53,54,53,54,56,52,55,
52,161,54,53,54,53,54,56,51,56,
54,159,54,161,55,53, // OFF:110
54
};

unsigned int data_heater_on[] = {
441,435,
54,161,54,161,54,161,54,160,54,55,52,56,51,162,54,55,
52,56,51,57,50,56,52,53,54,161,54,161,54,56,51,161,
55,55,52,56,51,56,52,55,
54,53,54,53,52,161,54,161,
54,161,54,161,54,161,54,161,54,160,55,161,54,56,52,55,
52,55,52,53,54,55,52,55,52,56,52,55,52,56,
52,161,54,55,52,161,56,53,52,56,
52,54,53,56,52,56,
51,53,54,161,54,161,
54,56,54,53,52,55,
52,56,54,159,54,161, // ON:011
54,54,54,55,54,53,52,55,52,56,51,55,52,56,52,56,
52,161,54,53,56,53,52,55,52,55,
52,55,52,161,54,56, // ON:010
52,537,438,438,
57,158,54,161,54,161,54,161,54,56,51,56,52,162,54,55,52,
53,54,56,51,56,52,55,52,161,54,162,54,55,54,159,
54,56,52,56,51,56,51,55,
52,56,51,56,52,161,54,161,
54,161,54,161,54,162,54,162,54,161,54,161,54,56,51,56,
52,56,51,55,52,56,52,56,52,53,54,56,52,55,
54,159,54,56,52,162,53,56,51,56,
52,56,51,55,52,56,
51,55,52,162,54,161,
54,55,52,53,54,56,
52,56,54,159,54,161,
54,55,52,53,54,56,52,55,52,55,54,53,52,55,52,55,
52,164,52,56,51,56,52,56,52,55,
52,55,52,164,52,56,
51
};

EthernetClient client;

void setup()
{
  pinMode(ledPin, OUTPUT);
  Ethernet.begin(mac, ip);
  Serial.begin(9600);
  delay(1000);
}

void loop()
{
  String data = "celsius=" + lm35dz();

  if (client.connect(server, 3000)) {
    http_post(data);
  }
  delay(1000);

  String command = response();  
  if(command == "command: power off"){
    data_choice = 0;
    ir_send();
  }else if(command == "command: heater on"){
    data_choice = 1;
    ir_send();
  }else if(command == "command: cooler on"){
    // TODO: cooler pattern
    data_choice = 1;
    ir_send();
  }

  if (!client.connected()) {
    client.stop();
  }
  delay(60000);
}

String lm35dz()
{
  float sum = 0.0;
  for(int i = 0; i < 10; i++){
    sum += analogRead(0);
    delay(1000);
  }
  float m = sum / 10;
  float temperate = celsius(m);
  char buf[8];
  dtostrf(temperate, 0, 2, buf);
  return String(buf);
}

float celsius(float v)
{
  return  ((5.0 * v) / 1023) * 100;
}

void http_post(String data)
{
    client.println("POST /temperature HTTP/1.1");
    client.println("Host: 192.168.100.12");
    client.println("Content-Type: application/x-www-form-urlencoded");
    client.println("Connection: close");
    client.print("Content-Length: ");
    client.println(data.length());
    client.println();
    client.print(data);
    client.println();
}

String response()
{
  char buf[128];
  int index = 0;

  while(client.available()) {
    char c = client.read();
    if(c != 0x0a && index < 127) {
      buf[index++] = c;
    }else{
      buf[index] = 0;
      index = 0;
    }
  }
  return String(buf);
}

void ir_send()
{
  int dataSize = 0;
  if(data_choice == 0){
   dataSize = sizeof(data_off) / sizeof(data_off[0]);
  }else{
   dataSize = sizeof(data_heater_on) / sizeof(data_heater_on[0]);
  }
  for (int cnt = 0; cnt < dataSize; cnt++) {
    unsigned long len = 0;
    if(data_choice == 0){
      len = data_off[cnt] * 10;
    }else{
      len = data_heater_on[cnt] * 10;
    }
    unsigned long us = micros();
    do {
      digitalWrite(ledPin, 1 - (cnt&1)); // cntが偶数なら赤外線ON、奇数ならOFFのまま
      delayMicroseconds(8);  // キャリア周波数38kHzでON/OFFするよう時間調整
      digitalWrite(ledPin, 0);
      delayMicroseconds(7);
    } while (long(us + len - micros()) > 0); // 送信時間に達するまでループ
  }
}

