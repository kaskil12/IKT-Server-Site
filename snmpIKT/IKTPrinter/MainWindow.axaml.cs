using Avalonia.Controls;
using Lextm.SharpSnmpLib;
using System;
using System.Collections.Generic;
using System.Net.NetworkInformation;
namespace IKTPrinter;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        Console.Write("10.230.144.43");
        PingTextBlock.Text = "Pinging...";
        Ping();
    }
    void Retry_Click(object sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        PingTextBlock.Text = "Pinging...";
        ColorTextBlock.Text = "Loading...";
        Ping();
    }
    void Ping()
    {
        try
        {
            using (Ping ping = new Ping())
            {
                PingReply reply = ping.Send("10.230.144.43");
                if (reply.Status == IPStatus.Success)
                {
                    PingTextBlock.Text = "Ping successful: " + reply.RoundtripTime + " ms";
                    GetColor();
                }
                else
                {
                    PingTextBlock.Text = "Ping failed: " + reply.Status;
                }
            }
        }
        catch (Exception ex)
        {
            PingTextBlock.Text = "Error: " + ex.Message;
        }
    }
//Name/OID: .1.3.6.1.2.1.43.11.1.1.9.1.2; Value (Integer): 46
    private void GetColor()
    {
        try
        {
            var result = Lextm.SharpSnmpLib.Messaging.Messenger.Get(
                VersionCode.V1,
                new System.Net.IPEndPoint(System.Net.IPAddress.Parse("10.230.144.43"), 161),
                new OctetString("public"),
                new List<Variable>
                {
                    new(new ObjectIdentifier(".1.3.6.1.2.1.43.11.1.1.9.1.2"))
                },
                6000
            );
            ColorTextBlock.Text = result[0].Data.ToString();
        }
        catch (TimeoutException ex)
        {
            ColorTextBlock.Text = "Timeout: " + ex.Message;
        }
        catch (Exception ex)
        {
            ColorTextBlock.Text = "Error: " + ex.Message;
        }
    }
}